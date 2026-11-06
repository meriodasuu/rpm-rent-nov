import { ArrowRight, CalendarDays, Check, CircleDollarSign, FileCheck2, Gauge, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CarGallery } from "@/components/car-gallery";
import { CarCard } from "@/components/car-card";
import { CarImportedDetails } from "@/components/car-imported-details";
import { DirectTrafficBookingPanel, DirectTrafficMobileCta } from "@/components/direct-traffic-booking-panel";
import { FaqList } from "@/components/faq-list";
import { getCarEditorial } from "@/lib/content";
import { getStore } from "@/lib/data";
import { bookingPolicyProblem } from "@/lib/domain/booking";
import { assertRentalPeriod, parseDateOnly, todayInBusinessTimeZone } from "@/lib/domain/dates";
import { isPaidLeadAttribution } from "@/lib/direct-traffic";
import { formatDeposit, formatPrice } from "@/lib/format";
import { socialPreviewImage } from "@/config/social-preview";
import { buildCarSeoTitle, siteUrl, serializeJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const [car, cars] = await Promise.all([store.getCarBySlug(slug), store.getCars()]);
  if (!car) return { title: "Автомобиль не найден" };
  return {
    title: { absolute: buildCarSeoTitle(car, cars) },
    description: car.seoDescription || `Аренда ${car.title} в Санкт-Петербурге: стоимость в сутки, условия и заявка на удобную дату в RPM Rent.`,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: { images: [socialPreviewImage] }
  };
}

export default async function CarPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ start?: string; end?: string; yclid?: string; utm_source?: string }> }) {
  const { slug } = await params;
  const period = await searchParams;
  const store = await getStore();
  const [car, cars, faqs] = await Promise.all([store.getCarBySlug(slug), store.getCars(), store.getFaqs()]);
  if (!car) notFound();

  let periodAvailable: boolean | undefined;
  if (period.start && period.end && parseDateOnly(period.start) && parseDateOnly(period.end)) {
    try {
      assertRentalPeriod({ startDate: period.start, endDate: period.end });
      periodAvailable = await store.isCarAvailable(car.id, period.start, period.end);
    } catch { periodAvailable = undefined; }
  }
  const policyProblem = bookingPolicyProblem(car);
  const busyForPeriod = periodAvailable === false && !policyProblem;
  const bookable = !policyProblem && !busyForPeriod;
  const isDirect = isPaidLeadAttribution(new URLSearchParams(Object.entries(period).flatMap(([key, value]) => value ? [[key, value]] : [])));

  const editorial = getCarEditorial(car);
  const specs = [
    ["Класс", car.vehicleClass], ["Кузов", car.bodyType], ["Год", car.year],
    ["Коробка", car.transmission], ["Привод", car.driveType], ["Двигатель", car.engine],
    ["Мощность", car.horsepower ? `${car.horsepower} л.с.` : null], ["Места", car.seats]
  ].filter((item): item is [string, string | number] => Boolean(item[1]));
  const conditions = [
    { icon: WalletCards, title: "Залог", value: formatDeposit(car.deposit), note: "Условия залога согласовываются индивидуально." },
    { icon: UserRound, title: "Возраст", value: car.minimumAge !== null ? `от ${car.minimumAge} лет` : null, note: "Требование для этого автомобиля." },
    { icon: Gauge, title: "Стаж", value: car.minimumDrivingExperience !== null ? `от ${car.minimumDrivingExperience} мес.` : null, note: "Минимальный водительский стаж." },
    { icon: CalendarDays, title: "Минимальный срок", value: car.minimumRentalDays !== null ? `${car.minimumRentalDays} сут.` : null, note: "Дата возврата не входит в оплачиваемый период." },
    { icon: Gauge, title: "Пробег", value: car.mileageLimit ? `${car.mileageLimit} км / сутки` : null, note: "Включённый суточный лимит." },
    { icon: Gauge, title: "Перепробег", value: car.extraMileagePrice ? `${formatPrice(car.extraMileagePrice)} / км` : null, note: "Стоимость сверх лимита." },
    { icon: ShieldCheck, title: "Страхование", value: car.insurance, note: "Условия страхования автомобиля." }
  ].filter((item): item is { icon: typeof Gauge; title: string; value: string; note: string } => Boolean(item.value));
  const bookingHref = `/booking?car=${car.slug}${period.start && period.end ? `&start=${encodeURIComponent(period.start)}&end=${encodeURIComponent(period.end)}` : ""}`;
  const recommendations = cars
    .filter((item) => item.id !== car.id)
    .sort((a, b) => {
      const aScore = Number(a.vehicleClass === car.vehicleClass) * 3 - Math.abs(a.pricePerDay - car.pricePerDay) / 100000;
      const bScore = Number(b.vehicleClass === car.vehicleClass) * 3 - Math.abs(b.pricePerDay - car.pricePerDay) / 100000;
      return bScore - aScore;
    })
    .slice(0, 3);

  return (
    <div className="page car-detail-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Service", "@id": `${siteUrl}/cars/${car.slug}#rental`,
            name: `Аренда ${car.title}`, url: `${siteUrl}/cars/${car.slug}`,
            serviceType: "Аренда автомобиля", areaServed: "Санкт-Петербург",
            provider: { "@id": `${siteUrl}/#organization` },
            offers: { "@type": "Offer", url: `${siteUrl}/cars/${car.slug}`, priceCurrency: "RUB",
              priceSpecification: { "@type": "UnitPriceSpecification", price: car.pricePerDay, priceCurrency: "RUB", unitText: "сутки" } }
          },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Каталог", item: `${siteUrl}/cars` },
            { "@type": "ListItem", position: 3, name: car.title, item: `${siteUrl}/cars/${car.slug}` }
          ] }
        ]
      }) }} />
      <div className="container">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/cars" }, { label: car.title }]} />
        <div className="page-intro car-intro"><div><p className="eyebrow">{car.brand} · {car.vehicleClass}</p><h1 className="title">{car.title}</h1></div><div><p className="car-intro-index">RPM / {String(car.recommendedOrder).padStart(2, "0")}</p><p className="subtitle">{editorial.intro}</p></div></div>

        <div className="detail-layout">
          <CarGallery images={car.images} title={car.title} />
          <DirectTrafficBookingPanel directOnEntry={isDirect} car={{ id: car.id, title: car.title, pricePerDay: car.pricePerDay }} initialStart={todayInBusinessTimeZone()}><aside className="surface booking-card">
            <span className="tag">{bookable ? "Доступен для оформления" : busyForPeriod ? "Занят на выбранные даты" : "Онлайн-оформление недоступно"}</span>
            <p className="booking-card-label">Стоимость аренды</p>
            <div className="price">{formatPrice(car.pricePerDay)} <small>/ сутки</small></div>
            <div className="summary-lines">
              <div className="summary-line"><span>Залог</span><strong>{formatDeposit(car.deposit)}</strong></div>
              <div className="summary-line"><span>Расчёт</span><strong>по выбранным датам</strong></div>
              <div className="summary-line"><span>Подтверждение</span><strong>менеджером</strong></div>
            </div>
            {policyProblem ? <p className="period-note"><FileCheck2 size={16} /> {policyProblem}. Точные требования должен опубликовать владелец.</p> : busyForPeriod ? <p className="period-note"><CalendarDays size={16} /> На выбранный период уже есть активное обращение. Измените даты в каталоге.</p> : period.start && period.end ? <p className="period-note"><CalendarDays size={16} /> Автомобиль свободен на выбранный период; сервер проверит его ещё раз при отправке.</p> : <p className="period-note"><CalendarDays size={16} /> Укажите период при оформлении. Система повторно проверит доступность.</p>}
            <Link className="button red" href={busyForPeriod ? "/cars" : bookingHref} data-event={busyForPeriod ? "date_check" : "booking_open"} data-event-label={car.slug}>{busyForPeriod ? "Изменить даты" : "Забронировать"} <ArrowRight size={17} /></Link>
            <Link className="booking-secondary" href="/rental-terms">Посмотреть общие условия</Link>
          </aside></DirectTrafficBookingPanel>
        </div>

        <section className="detail-section detail-editorial">
          <div><p className="eyebrow">Почему этот вариант</p><h2>Что важно при выборе {car.title}</h2><p className="detail-copy">Автомобиль стоит оценивать не только по фотографии. Сравните формат кузова, сценарий поездки, стоимость и условия с альтернативами в каталоге.</p></div>
          <div className="reason-grid">{editorial.reasons.map((reason, index) => <article className="reason-card" key={`${reason.title}-${index}`}><Check size={18} /><h3>{reason.title}</h3><p>{reason.text}</p></article>)}</div>
        </section>

        <section className="detail-section"><div className="detail-section-head"><div><p className="eyebrow">Данные автомобиля</p><h2>Характеристики</h2></div><p>Показываем только заполненные параметры. Подтверждённые ограничения по аренде вынесены в отдельный блок ниже.</p></div><div className="spec-grid">{specs.map(([label, value]) => <div className="spec" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>

        <CarImportedDetails features={car.features} rentalConditions={car.rentalConditions} />

        <section className="detail-section use-cases-section"><div><p className="eyebrow">Сценарии</p><h2>Подойдёт для</h2></div><div className="use-case-list">{editorial.useCases.map((item, index) => <span className="use-case-chip" key={`${item}-${index}`}>{item}</span>)}</div><p className="detail-copy">Если ваш сценарий требует доставки, водителя или специальной подготовки для события, укажите это при оформлении. Возможность и стоимость согласуются отдельно.</p></section>

        <section className="detail-section">
          <div className="detail-section-head"><div><p className="eyebrow">Перед оформлением</p><h2>Условия этого автомобиля</h2></div><p>Ставка участвует в предварительном расчёте, а залог согласовывается индивидуально. Остальные параметры указаны в карточке автомобиля.</p></div>
          {policyProblem ? <p className="field-error">Возраст, водительский стаж и минимальный срок пока не опубликованы. Система не принимает онлайн-обращение без этих данных.</p> : null}
          <div className="condition-list">{conditions.map(({ icon: Icon, title, value, note }) => <div className="condition condition-rich" key={title}><Icon size={20} aria-hidden /><div><strong>{title}</strong><span>{value}</span><small>{note}</small></div></div>)}</div>
          <div className="rental-assurance"><FileCheck2 size={22} /><div><h3>Финальные условия фиксируются до получения автомобиля</h3><p>Менеджер подтверждает доступность, способ получения и применимые ограничения. Отправка формы сама по себе не является бронью.</p></div><Link className="text-link" href="/rental-terms">Подробнее <ArrowRight size={16} /></Link></div>
        </section>

        <section className="detail-section price-detail-section">
          <div><p className="eyebrow">Расчёт</p><h2>Что вы увидите при оформлении</h2><p className="detail-copy">Система рассчитает аренду по суточной ставке и длительности периода. Платные услуги добавляются только при выборе, а условия залога подтвердит менеджер.</p></div>
          <div className="price-detail-card surface"><CircleDollarSign size={22} /><div className="price-line"><span>Ставка</span><strong>{formatPrice(car.pricePerDay)} / сутки</strong></div><div className="price-line"><span>Срок</span><strong>по выбранным датам</strong></div><div className="price-line"><span>Залог</span><strong>{formatDeposit(car.deposit)}</strong></div></div>
        </section>

        <section className="detail-section"><div className="grid-2"><div><p className="eyebrow">До оформления</p><h2>Ответы на частые вопросы</h2><p className="detail-copy">Проверьте, как рассчитывается сумма, когда подтверждается автомобиль и какие параметры зависят от конкретной модели.</p><div className="button-row"><Link className="button ghost" href="/faq">Все вопросы</Link><Link className="button" href={bookingHref}>Забронировать</Link></div></div><FaqList items={faqs.slice(0, 6)} /></div></section>

        <section className="detail-section" style={{ borderBottom: 0 }}><div className="section-head section-head-copy"><div><p className="eyebrow">Продолжите выбор</p><h2 className="title">Похожие автомобили</h2></div><p className="section-lead">Альтернативы подобраны по классу и близости суточной ставки. Сравните несколько вариантов перед выбором дат.</p></div><div className="car-grid">{recommendations.map((item) => <CarCard key={item.id} car={item} period={period} />)}</div><div className="section-action"><Link className="button ghost" href="/cars">Вернуться в каталог <ArrowRight size={17} /></Link></div></section>
      </div>
      <DirectTrafficMobileCta directOnEntry={isDirect} fallbackHref={busyForPeriod ? "/cars" : bookingHref} fallbackEvent={busyForPeriod ? "date_check" : "booking_open"} fallbackLabel={`${car.slug}_sticky`} fallbackText={busyForPeriod ? "Изменить даты" : `Забронировать · ${formatPrice(car.pricePerDay)}`} />
    </div>
  );
}
