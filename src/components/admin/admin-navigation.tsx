"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CarFront, ExternalLink, FileText, Inbox, LayoutDashboard, MapPinned, RadioTower } from "lucide-react";
import { isNavigationActive } from "@/lib/navigation";

const items = [
  { href: "/admin", label: "Сегодня", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Обращения", icon: Inbox },
  { href: "/admin/calendar", label: "Календарь", icon: CalendarDays },
  { href: "/admin/cars", label: "Автопарк", icon: CarFront },
  { href: "/admin/marketplaces", label: "Контроль площадок", icon: RadioTower },
  { href: "/admin/locations", label: "Локации", icon: MapPinned },
  { href: "/admin/content", label: "Контент", icon: FileText }
];

export function AdminNavigation() {
  const pathname = usePathname();
  return <nav className="admin-nav" aria-label="Разделы панели управления">
    {items.map(({ href, label, icon: Icon }) => {
      const active = isNavigationActive(pathname, href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" size={18} strokeWidth={1.8} /><span>{label}</span></Link>;
    })}
    <a href="https://club.rpm-rent.ru/admin/login" target="_blank" rel="noopener noreferrer" aria-label="RPM Club — открыть админку в новой вкладке" title="RPM Club — открыть админку в новой вкладке"><ExternalLink aria-hidden="true" size={18} strokeWidth={1.8} /><span>RPM Club</span></a>
    <Link className="admin-public-link" href="/" target="_blank"><ExternalLink aria-hidden="true" size={18} strokeWidth={1.8} /><span>Открыть сайт</span></Link>
  </nav>;
}
