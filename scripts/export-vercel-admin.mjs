import { createHmac } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const baseUrl = "https://rpm-rent-vercel-d0530d3c8a664ae29c4.vercel.app";
const outputPath = "import/vercel-admin-export.json";

const env = Object.fromEntries(
  (await readFile(".env.local", "utf8"))
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, "$2")];
    }),
);

if (!env.AUTH_SECRET || !env.ADMIN_EMAIL) throw new Error("Missing local admin session settings");

const payload = Buffer.from(JSON.stringify({
  email: env.ADMIN_EMAIL,
  expires: Date.now() + 60 * 60 * 1000,
})).toString("base64url");
const signature = createHmac("sha256", env.AUTH_SECRET).update(payload).digest("base64url");
const cookie = `rpm_admin_session=${payload}.${signature}`;

const decode = (value = "") => value
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&amp;/g, "&");

const flightStream = (html) => [...html.matchAll(/self\.__next_f\.push\(([\s\S]*?)\)<\/script>/g)]
    .map((match) => JSON.parse(decode(match[1])))
    .filter((entry) => entry[0] === 1 && typeof entry[1] === "string")
    .map((entry) => entry[1])
    .join("");

const flightValues = (html) => {
  const stream = flightStream(html);
  const records = new Map();
  for (const line of stream.split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const id = line.slice(0, separator);
    const serialized = line.slice(separator + 1);
    if (!serialized.startsWith("[") && !serialized.startsWith("{")) continue;
    try { records.set(id, JSON.parse(serialized)); } catch { /* Ignore non-JSON protocol records. */ }
  }
  const resolving = new Set();
  const resolve = (value) => {
    if (typeof value === "string") {
      const reference = value.match(/^\$([\da-z]+)$/i);
      if (!reference || !records.has(reference[1]) || resolving.has(reference[1])) return value;
      resolving.add(reference[1]);
      const result = resolve(records.get(reference[1]));
      resolving.delete(reference[1]);
      return result;
    }
    if (Array.isArray(value)) return value.map(resolve);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item)]));
    return value;
  };
  return [...records.values()].map(resolve);
};

const visit = (value, callback) => {
  callback(value);
  if (Array.isArray(value)) value.forEach((item) => visit(item, callback));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => visit(item, callback));
};

const elementForms = (html) => {
  const formElements = [];
  for (const root of flightValues(html)) visit(root, (value) => {
    if (Array.isArray(value) && value[0] === "$" && value[1] === "form" && value[3]) formElements.push(value);
  });
  return formElements.map((form) => {
  const values = {};
  visit(form, (element) => {
    if (!Array.isArray(element) || element[0] !== "$" || !element[3]) return;
    const [,, , props] = element;
    if ((element[1] === "input" || element[1] === "textarea") && props.name && !String(props.name).startsWith("$ACTION_")) {
      if (props.type === "checkbox" && props.defaultChecked !== true) return;
      const next = props.type === "checkbox" ? (props.value || "on") : (props.value ?? props.defaultValue ?? "");
      values[props.name] = values[props.name] === undefined
        ? next
        : [...(Array.isArray(values[props.name]) ? values[props.name] : [values[props.name]]), next];
    }
    if (props.name === "images" && Array.isArray(props.initialImages)) values.images = props.initialImages;
  });
  return values;
  });
};

const allFields = (html) => {
  const values = {};
  for (const root of flightValues(html)) visit(root, (element) => {
    if (!Array.isArray(element) || element[0] !== "$" || !element[3]) return;
    const [,, , props] = element;
    if ((element[1] === "input" || element[1] === "textarea") && props.name && !String(props.name).startsWith("$ACTION_")) {
      if (props.type === "checkbox" && props.defaultChecked !== true) return;
      const next = props.type === "checkbox" ? (props.value || "on") : (props.value ?? props.defaultValue ?? "");
      if (values[props.name] === undefined || values[props.name] === "") values[props.name] = next;
    }
    if (props.name === "images" && Array.isArray(props.initialImages) && props.initialImages.length) values.images = props.initialImages;
  });
  const media = [...flightStream(html).matchAll(/"name":"images"[\s\S]{0,500}?"initialImages":(\[[^\]]*\])/g)]
    .map((match) => { try { return JSON.parse(match[1]); } catch { return []; } })
    .sort((left, right) => right.length - left.length)[0];
  if (media?.length) values.images = media;
  return values;
};

const request = async (path) => {
  const response = await fetch(`${baseUrl}${path}`, { headers: { cookie } });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  if (response.url.endsWith("/admin/login")) throw new Error(`${path}: authentication failed`);
  return response.text();
};

const carsIndex = await request("/admin/cars");
const carsFlight = flightValues(carsIndex);
const carIds = [];
for (const root of carsFlight) visit(root, (value) => {
  if (value && typeof value === "object" && typeof value.href === "string") {
    const match = value.href.match(/^\/admin\/cars\/([a-z0-9-]+)$/);
    if (match && match[1] !== "new") carIds.push(match[1]);
  }
});
const uniqueCarIds = [...new Set(carIds)]
  .filter((id) => id !== "new");
const cars = [];
for (const id of uniqueCarIds) {
  const page = await request(`/admin/cars/${encodeURIComponent(id)}`);
  const car = allFields(page);
  if (!car) throw new Error(`Could not read car ${id}`);
  cars.push(car);
}

const contentForms = elementForms(await request("/admin/content"));
const services = contentForms.filter((form) => form.id && form.slug && form.title && "price" in form);
const faqs = contentForms.filter((form) => form.id && form.question && form.answer);
const locationForms = elementForms(await request("/admin/locations")).filter((form) => form.id && form.slug && form.slug !== "$undefined" && form.title && form.title !== "$undefined");
const locations = [...new Set(locationForms.map((form) => form.id))].map((id) => {
  const candidates = locationForms.filter((form) => form.id === id).sort((left, right) => Object.keys(left).length - Object.keys(right).length);
  return Object.assign({}, ...candidates);
});
const locationsHtml = await request("/admin/locations");
for (const field of ["mapUrl", "directions", "seoTitle", "seoDescription", "published"]) {
  const series = flightValues(locationsHtml).map((root) => {
    const values = [];
    visit(root, (element) => {
      if (!Array.isArray(element) || element[0] !== "$" || !element[3] || (element[1] !== "input" && element[1] !== "textarea")) return;
      const props = element[3];
      if (props.name !== field) return;
      values.push(props.type === "checkbox" ? props.defaultChecked === true : (props.defaultValue === "$undefined" ? "" : (props.defaultValue ?? "")));
    });
    return values;
  }).sort((left, right) => right.length - left.length)[0] ?? [];
  if (series.length >= locations.length) locations.forEach((location, index) => { location[field] = series[index]; });
}
const bookingsHtml = await request("/admin/bookings?filter=all");
let bookings = [];
for (const root of flightValues(bookingsHtml)) visit(root, (value) => {
  if (value && typeof value === "object" && Array.isArray(value.bookings)) bookings = value.bookings;
});
const bookingCount = bookings.length;

await mkdir("import", { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ source: baseUrl, exportedAt: new Date().toISOString(), cars, services, faqs, locations, bookings }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ cars: cars.length, images: cars.reduce((total, car) => total + (Array.isArray(car.images) ? car.images.length : car.images ? 1 : 0), 0), services: services.length, faqs: faqs.length, locations: locations.length, bookings: bookingCount }));
