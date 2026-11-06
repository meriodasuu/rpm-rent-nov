import { ArrowRight, CalendarCheck, CarFront, Film, KeyRound, MapPin, Sparkles, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getServiceContext } from "@/lib/content";
import { getStore } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Услуги аренды автомобилей в Санкт-Петербурге", description: "Посуточная и долгосрочная аренда автомобилей, доставка, аренда с водителем и автомобили для мероприятий в Санкт-Петербурге.", alternates: { canonical: "/services" } };
const icons = [KeyRound, CalendarCheck, UserRound, MapPin, Sparkles, Film];

export default async function ServicesPage() {
  const services = await (await getStore()).getServices();
  return <div className="page services-page"><div className="container">
    <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Услуги" }]} />
    <header className="simple-page-heading"><h1 className="title">Услуги аренды автомобилей в Санкт-Петербурге</h1><p>Выберите автомобиль, период и нужный формат аренды. Детали менеджер подтвердит до оформления.</p></header>
    <div className="service-detail-grid">{services.map((service, index) => { const Icon = icons[index % icons.length] ?? CarFront; const context = getServiceContext(service); return <article className="service-detail-card" key={service.id}><div className="service-detail-top"><div className="icon-box"><Icon size={20} /></div><span>{String(index + 1).padStart(2, "0")}</span></div><h2>{service.title}</h2><p>{service.description}</p><div className="service-context"><strong>Кому подойдёт</strong><span>{context.audience}</span></div><div className="service-context"><strong>Как заказать</strong><span>{context.order}</span></div><div className="service-detail-bottom"><span>{service.price ? `от ${formatPrice(service.price)}` : "Стоимость по согласованию"}</span><Link href={`/booking?service=${service.slug}`} data-event="service_open" data-event-label={service.slug}>Добавить к оформлению <ArrowRight size={15} /></Link></div></article>; })}</div>
    <section className="section"><div className="section-head section-head-copy"><div><h2 className="title">Сначала маршрут, затем опции</h2></div><p className="section-lead">Форма остаётся короткой, а менеджер получает достаточно контекста для точного ответа.</p></div><div className="steps"><article className="step"><h3>Определите период</h3><p>Один день, выходные или продолжительный срок.</p></article><article className="step"><h3>Выберите автомобиль</h3><p>Сравните кузов, класс и суточную ставку.</p></article><article className="step"><h3>Добавьте услугу</h3><p>Отметьте нужный вариант или опишите задачу.</p></article><article className="step"><h3>Получите подтверждение</h3><p>Менеджер проверит автомобиль, период и индивидуальные условия залога.</p></article></div></section>
    <section className="service-note surface"><div><h2>Услуга подтверждается менеджером</h2><p>Доступность водителя, доставка по адресу, участие автомобиля в событии или съёмке зависят от выбранной модели, даты и задачи.</p></div><div className="button-row"><Link className="button" href="/cars">Выбрать автомобиль</Link><Link className="button ghost" href="/contacts">Уточнить вопрос</Link></div></section>
    <section className="section"><div className="cta-panel"><div className="cta-content"><h2 className="title">Выберите автомобиль для оформления</h2><div className="button-row"><Link className="button red" href="/cars">Открыть каталог <ArrowRight size={18} /></Link></div></div></div></section>
  </div></div>;
}
