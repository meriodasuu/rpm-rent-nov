import type { Metadata } from "next";
import { MessageCircle, Phone, Send } from "lucide-react";
import Link from "next/link";
import { CONTACTS } from "@/lib/site-content";

export const metadata: Metadata = { title: "Заявка отправлена", robots: { index: false, follow: false } };

export default function ThankYouPage() {
  const telegram = CONTACTS.socials.find((item) => item.label === "Telegram");
  return <main className="page"><div className="container"><section className="surface success-panel" style={{ marginBlock: "clamp(72px, 12vw, 150px)", textAlign: "center" }}>
    <div className="success-icon" style={{ marginInline: "auto" }}>✓</div>
    <h1 className="title">Заявка принята</h1>
    <p className="subtitle" style={{ marginInline: "auto", maxWidth: 620 }}>Менеджер проверит автомобиль и даты, уточнит условия аренды и свяжется с вами.</p>
    <div className="button-row" style={{ justifyContent: "center", marginTop: 28 }}>
      <a className="button" href={CONTACTS.phoneHref} data-event="phone_click" data-event-label="spasibo"><Phone size={17} /> Позвонить</a>
      {telegram ? <a className="button ghost" data-direct-messenger="true" href={telegram.href} target="_blank" rel="noreferrer" data-event="telegram_click" data-event-label="spasibo"><Send size={17} /> Telegram</a> : null}
      <a className="button ghost" data-direct-messenger="true" href={CONTACTS.max.href} target="_blank" rel="noreferrer" data-event="max_click" data-event-label="spasibo"><MessageCircle size={17} /> MAX</a>
    </div>
    <div className="button-row" style={{ justifyContent: "center", marginTop: 16 }}><Link className="text-link" href="/cars">Вернуться в каталог</Link></div>
  </section></div></main>;
}
