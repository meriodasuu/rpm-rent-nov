"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { closeNavigationMenu, isNavigationActive } from "@/lib/navigation";

export const PRIMARY_LINKS = [
  ["Автомобили", "/cars"],
  ["Услуги", "/services"],
  ["Условия", "/rental-terms"],
  ["О компании", "/about"],
  ["Контакты", "/contacts"]
] as const;

export function PrimaryNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const closeMobileMenu = (target: HTMLAnchorElement) => {
    if (mobile) closeNavigationMenu(target.closest("details") as HTMLDetailsElement | null);
  };

  return (
    <nav className={mobile ? "mobile-nav" : "nav"} aria-label={mobile ? "Мобильная навигация" : "Основная навигация"}>
      {PRIMARY_LINKS.map(([label, href]) => {
        const active = isNavigationActive(pathname, href);
        return <Link aria-current={active ? "page" : undefined} className={active ? "active" : undefined} href={href} key={href} onClick={(event) => closeMobileMenu(event.currentTarget)}>{label}</Link>;
      })}
      {mobile ? <Link aria-current={isNavigationActive(pathname, "/faq") ? "page" : undefined} className={isNavigationActive(pathname, "/faq") ? "active" : undefined} href="/faq" onClick={(event) => closeMobileMenu(event.currentTarget)}>FAQ</Link> : null}
    </nav>
  );
}
