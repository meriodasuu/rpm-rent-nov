"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getMarketingAttribution } from "./marketing-attribution";
import { isPaidLeadAttribution } from "@/lib/direct-traffic";
import { DirectLeadForm } from "./direct-lead-form";

const useDirectTraffic = (directOnEntry: boolean) => {
  const pathname = usePathname();
  const [isDirect, setIsDirect] = useState(directOnEntry);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const hasCampaign = [...params.keys()].some((key) => key.startsWith("utm_") || key === "yclid" || key === "rb_clickid");
      setIsDirect(hasCampaign ? isPaidLeadAttribution(params) : isPaidLeadAttribution(new URLSearchParams(getMarketingAttribution())));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [directOnEntry, pathname]);
  return isDirect;
};

export function DirectTrafficBookingPanel({ directOnEntry, car, initialStart, children }: {
  directOnEntry: boolean;
  car: { id: string; title: string; pricePerDay: number };
  initialStart: string;
  children: ReactNode;
}) {
  const isDirect = useDirectTraffic(directOnEntry);
  return isDirect ? <DirectLeadForm car={car} initialStart={initialStart} /> : children;
}

export function DirectTrafficMobileCta({ directOnEntry, fallbackHref, fallbackEvent, fallbackLabel, fallbackText }: {
  directOnEntry: boolean;
  fallbackHref: string;
  fallbackEvent: string;
  fallbackLabel: string;
  fallbackText: string;
}) {
  const isDirect = useDirectTraffic(directOnEntry);
  return <div className="mobile-cta"><Link className="button red" href={isDirect ? "#direct-lead" : fallbackHref} data-event={isDirect ? "direct_lead_open" : fallbackEvent} data-event-label={fallbackLabel}>{isDirect ? "Оставить заявку" : fallbackText}</Link></div>;
}
