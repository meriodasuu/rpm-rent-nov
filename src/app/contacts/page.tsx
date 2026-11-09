import { Globe2, Instagram, MapPin, MessageCircle, Music2, Phone, Send, ShoppingBag, Youtube } from "lucide-react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "next/link";
import { CONTACTS, socialEventSlug } from "@/lib/site-content";

export const metadata: Metadata = { title: "Контакты", description: "Свяжитесь с RPM Rent по вопросу выбора и аренды автомобиля в Санкт-Петербурге.", alternates: { canonical: "/contacts" } };

const socialIcons = [MessageCircle, MessageCircle, Instagram, Music2, Youtube, Send, ShoppingBag, Globe2] as const;

export default function ContactsPage() {
  return (
    <div className="page contacts-page"><div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />
      <header className="contacts-heading"><h1 className="title">Контакты</h1><p>Свяжитесь удобным способом или сразу выберите автомобиль в каталоге.</p></header>

      <div className="contacts-layout">
        <section className="surface contacts-card">
          <div className="contacts-primary"><a href={CONTACTS.phoneHref} data-event="phone_click" data-event-label="contacts"><Phone size={22} /><span><small>Телефон</small><strong>{CONTACTS.phone}</strong></span></a><a className="contacts-max" href={CONTACTS.max.href} rel="noreferrer" target="_blank" data-event="max_click" data-event-label="contacts"><MessageCircle size={22} /><span><small>MAX · мессенджер</small><strong>{CONTACTS.max.phone}</strong><em>Найдите RPM Rent в MAX по этому номеру</em></span></a><a href={CONTACTS.mapHref} rel="noreferrer" target="_blank" data-event="map_click" data-event-label="contacts"><MapPin size={22} /><span><small>Адрес</small><strong>{CONTACTS.address}</strong></span></a></div>
          <div className="social-links" aria-label="Социальные сети RPM Rent">{CONTACTS.socials.map((social, index) => { const Icon = socialIcons[index] ?? Globe2; return <a aria-label={social.label} href={social.href} key={social.label} rel="noreferrer" target="_blank" title={social.label} data-event={socialEventSlug(social.label)} data-event-label="contacts"><Icon aria-hidden size={22} /><span>{social.label}</span></a>; })}</div>
          <div className="button-row"><Link className="button red" href="/cars">Выбрать автомобиль</Link></div>
        </section>

        <section className="surface contacts-map"><iframe allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={CONTACTS.mapEmbed} title="RPM Rent на Яндекс Картах" /><a href={CONTACTS.mapHref} rel="noreferrer" target="_blank">Открыть в Яндекс Картах <MapPin size={16} /></a></section>
      </div>
    </div></div>
  );
}
