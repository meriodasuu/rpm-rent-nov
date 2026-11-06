"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackVkContact, trackVkPageView, vkPixelId } from "@/lib/vk-pixel";

// Mounted by Analytics only after consent; no script request without an ID.
export function VkPixel() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const active = !!vkPixelId() && !/^\/admin(?:\/|$)/.test(pathname);
  useEffect(() => {
    if (!active) { lastPath.current = null; return; }
    if (lastPath.current !== pathname && trackVkPageView(pathname)) lastPath.current = pathname;
    const onTrack = (event: Event) => {
      const detail = (event as CustomEvent<{ event?: string }>).detail;
      if (detail?.event) trackVkContact(detail.event);
    };
    window.addEventListener("rpm:analytics", onTrack);
    return () => window.removeEventListener("rpm:analytics", onTrack);
  }, [active, pathname]);
  return active ? <Script id="vk-pixel" src="https://top-fwz1.mail.ru/js/code.js" strategy="afterInteractive" /> : null;
}
