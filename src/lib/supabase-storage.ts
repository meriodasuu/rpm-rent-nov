const bucket = () => process.env.SUPABASE_MEDIA_BUCKET?.trim() || "rpm-media";

const configuration = () => {
  const projectUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim().replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!projectUrl || !serviceKey) throw new Error("Supabase Storage не настроен");
  return { storageUrl: `${projectUrl}/storage/v1`, serviceKey };
};

const privilegedHeaders = (serviceKey: string) => ({
  Authorization: `Bearer ${serviceKey}`,
  apikey: serviceKey,
  "Content-Type": "application/json",
});

const storageError = async (response: Response) => {
  const message = await response.text().catch(() => "");
  return new Error(`Supabase Storage: ${response.status}${message ? ` — ${message.slice(0, 300)}` : ""}`);
};

export const createSignedUpload = async (path: string) => {
  const { storageUrl, serviceKey } = configuration();
  const response = await fetch(`${storageUrl}/object/upload/sign/${bucket()}/${path}`, {
    method: "POST",
    headers: privilegedHeaders(serviceKey),
    body: "{}",
    cache: "no-store",
  });
  if (!response.ok) throw await storageError(response);
  const data = await response.json() as { url?: string };
  if (!data.url) throw new Error("Supabase Storage не вернул ссылку загрузки");
  const uploadUrl = new URL(`${storageUrl}${data.url.startsWith("/") ? data.url : `/${data.url}`}`).toString();
  const token = new URL(uploadUrl).searchParams.get("token");
  if (!token) throw new Error("Supabase Storage не вернул токен загрузки");
  return { uploadUrl, token };
};

export const removeStorageObject = async (path: string) => {
  const { storageUrl, serviceKey } = configuration();
  const response = await fetch(`${storageUrl}/object/${bucket()}`, {
    method: "DELETE",
    headers: privilegedHeaders(serviceKey),
    body: JSON.stringify({ prefixes: [path] }),
    cache: "no-store",
  });
  if (!response.ok) throw await storageError(response);
};

export const downloadStorageObject = async (path: string) => {
  const { storageUrl, serviceKey } = configuration();
  const response = await fetch(`${storageUrl}/object/${bucket()}/${path}`, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    cache: "no-store",
  });
  if (!response.ok) throw await storageError(response);
  return response;
};
