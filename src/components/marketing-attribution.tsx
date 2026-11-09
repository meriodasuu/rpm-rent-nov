"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isPaidLeadAttribution } from "@/lib/direct-traffic";

const attributionKey = "rpm-marketing-attribution";
const consentKey = "rpm-cookie-consent";
const trackedParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid", "rb_clickid", "gclid", "fbclid", "roistat_visit"];
type Attribution = Record<string, string> & { landingPath?: string; referrer?: string };

export function MarketingAttribution() {
  const pathname = usePathname();
  const callTrackingUrl = process.env.NEXT_PUBLIC_CALLTRACKING_SCRIPT_URL;
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const current: Attribution = {};
    for (const key of trackedParams) {
      const value = params.get(key)?.trim();
      if (value) current[key] = value.slice(0, 200);
    }
    const previous = readAttribution();
    const freshCampaign = Object.keys(current).length > 0;
    const attribution: Attribution = freshCampaign
      ? { ...current, landingPath: window.location.pathname, referrer: document.referrer }
      : { ...previous, landingPath: previous.landingPath ?? window.location.pathname, referrer: previous.referrer ?? document.referrer };
    if (Object.keys(attribution).length > 0) window.sessionStorage.setItem(attributionKey, JSON.stringify(attribution));
    const isDirect = isPaidLeadAttribution(new URLSearchParams(attribution));
    window.sessionStorage.setItem("rpm-paid-lead", isDirect ? "1" : "0");
    document.documentElement.dataset.directTraffic = isDirect ? "true" : "false";
  }, [pathname]);
  useEffect(() => {
    const syncConsent = () => {
      const value = window.localStorage.getItem(consentKey);
      setConsent(value === "accepted" || value === "declined" ? value : null);
    };
    syncConsent();
    window.addEventListener("rpm:cookie-consent", syncConsent);
    return () => window.removeEventListener("rpm:cookie-consent", syncConsent);
  }, []);
  return callTrackingUrl && consent === "accepted" ? <Script src={callTrackingUrl} strategy="afterInteractive" data-rpm-calltracking="true" /> : null;
}

export function getMarketingAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  return readAttribution();
}

function readAttribution(): Attribution {
  try {
    const value = window.sessionStorage.getItem(attributionKey);
    const parsed = value ? JSON.parse(value) as Attribution : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch { return {}; }
}
