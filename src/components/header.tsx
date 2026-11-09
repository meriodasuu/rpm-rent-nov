import { Menu, Send } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";
import { phoneHref } from "@/lib/format";
import { PrimaryNav } from "./primary-nav";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const phone = process.env.NEXT_PUBLIC_PHONE;
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-brand"><Logo /><span>Saint Petersburg</span></div>
        <PrimaryNav />
        <div className="header-actions">
          {phone ? <a className="header-phone" href={phoneHref(phone)} data-event="phone_click" data-event-label="header">{phone}</a> : null}
          <ThemeToggle />
          <Link className="button small-button" data-direct-messenger={telegram ? "true" : undefined} href={telegram || "/contacts"} target={telegram ? "_blank" : undefined} data-event={telegram ? "telegram_click" : "contact_click"} data-event-label="header">
            <Send size={15} aria-hidden /> {telegram ? "Telegram" : "Связаться"}
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Открыть меню"><Menu size={20} /></summary>
            <div className="mobile-panel">
              <PrimaryNav mobile />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
