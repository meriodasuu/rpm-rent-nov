import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { trackVkContact, trackVkLead, trackVkPageView } from "./vk-pixel";

let queue: unknown[];
let consent: string;
let pathname: string;
beforeEach(() => {
  queue = []; consent = "accepted"; pathname = "/cars/test";
  const session = new Map<string, string>();
  vi.stubEnv("NEXT_PUBLIC_VK_PIXEL_ID", "123456");
  vi.stubEnv("NEXT_PUBLIC_VK_LEAD_GOAL", "lead");
  vi.stubGlobal("window", {
    _tmr: queue,
    location: { origin: "https://rpmrent.ru", get pathname() { return pathname; } },
    localStorage: { getItem: () => consent },
    sessionStorage: { getItem: (key: string) => session.get(key), setItem: (key: string, value: string) => session.set(key, value) },
  });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it.each(["https://rpmrent.ru", "https://rpm-rent.ru"])("uses the same pixel on %s and preserves the actual domain", (origin) => {
  vi.stubEnv("NEXT_PUBLIC_VK_PIXEL_ID", "3794185");
  Object.assign(window.location, { origin });
  trackVkPageView("/cars/test");
  trackVkLead("lead", crypto.randomUUID());
  expect(queue).toEqual([
    { id: "3794185", type: "pageView", start: expect.any(Number), url: `${origin}/cars/test` },
    { id: "3794185", type: "reachGoal", goal: "lead" },
  ]);
});

it("stays inactive without ID, without consent, and on admin routes", () => {
  vi.stubEnv("NEXT_PUBLIC_VK_PIXEL_ID", "");
  trackVkPageView(pathname);
  vi.stubEnv("NEXT_PUBLIC_VK_PIXEL_ID", "123456");
  consent = "declined";
  trackVkLead("lead", "declined");
  trackVkContact("phone_click");
  consent = "accepted"; pathname = "/admin/bookings";
  trackVkPageView(pathname);
  trackVkLead("lead", "admin");
  expect(queue).toEqual([]);
});

it("sends page paths and allowlisted contacts without personal data", () => {
  trackVkPageView(pathname);
  trackVkContact("phone_click");
  trackVkContact("direct_lead_submit_error");
  expect(queue).toEqual([
    { id: "123456", type: "pageView", start: expect.any(Number), url: "https://rpmrent.ru/cars/test" },
    { id: "123456", type: "reachGoal", goal: "phone_click" },
  ]);
});

it("counts a saved enquiry once, but counts distinct enquiries independently", () => {
  const id = crypto.randomUUID();
  trackVkLead("lead", id);
  trackVkLead("lead", id);
  trackVkLead("booking", id);
  expect(queue).toEqual(Array.from({ length: 2 }, () => ({ id: "123456", type: "reachGoal", goal: "lead" })));
});

it("honours a session deduplication marker after reload", () => {
  const id = crypto.randomUUID();
  window.sessionStorage.setItem(`rpm-vk-conversion:123456:lead:${id}`, "1");
  trackVkLead("lead", id);
  expect(queue).toEqual([]);
});

it("does not break the successful form flow when the vendor throws", () => {
  Object.assign(window, { _tmr: { push() { throw new Error("blocked"); } } });
  expect(() => trackVkLead("lead", crypto.randomUUID())).not.toThrow();
});
