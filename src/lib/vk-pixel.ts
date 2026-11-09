type PixelEvent = { id: string; type: "pageView" | "reachGoal"; start?: number; url?: string; goal?: string };
type PixelWindow = Window & { _tmr?: { push: (event: PixelEvent) => unknown } };

export function vkPixelId() {
  const id = process.env.NEXT_PUBLIC_VK_PIXEL_ID?.trim();
  return id && /^\d+$/.test(id) ? id : null;
}

function enabled() {
  try {
    return typeof window !== "undefined" && !!vkPixelId()
      && !/^\/admin(?:\/|$)/.test(window.location.pathname)
      && window.localStorage.getItem("rpm-cookie-consent") === "accepted";
  } catch { return false; }
}

function send(event: Omit<PixelEvent, "id">) {
  if (!enabled()) return false;
  try {
    const target = window as PixelWindow;
    const queue = target._tmr ?? (target._tmr = [] as PixelEvent[]);
    queue.push({ id: vkPixelId()!, ...event });
    return true;
  } catch { return false; } // Analytics must never interrupt a saved enquiry.
}

export function trackVkPageView(pathname: string) {
  return send({ type: "pageView", start: Date.now(), url: window.location.origin + pathname });
}

const sent = new Set<string>();
export function trackVkLead(kind: "lead" | "booking", id: string) {
  if (!id || !enabled()) return;
  const key = `rpm-vk-conversion:${vkPixelId()}:${kind}:${id}`;
  if (sent.has(key)) return;
  try { if (window.sessionStorage.getItem(key)) return; } catch { /* In-memory deduplication still applies. */ }
  const goal = process.env.NEXT_PUBLIC_VK_LEAD_GOAL?.trim() || "lead";
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(goal)) return;
  if (send({ type: "reachGoal", goal })) {
    sent.add(key);
    try { window.sessionStorage.setItem(key, "1"); } catch { /* Storage may be unavailable. */ }
  }
}

export function trackVkContact(event: string) {
  if (["phone_click", "telegram_click", "max_click", "whatsapp_click"].includes(event)) {
    send({ type: "reachGoal", goal: event });
  }
}
