"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { isYandexMediaUrl } from "@/lib/yandex-public-media";
import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RENTAL_POLICY } from "@/config/rental-policy";
import { bookingPolicyProblem } from "@/lib/domain/booking";
import { parseDateOnly, todayInBusinessTimeZone } from "@/lib/domain/dates";
import { formatDeposit, formatPrice } from "@/lib/format";
import { trackVkLead } from "@/lib/vk-pixel";
import { getMarketingAttribution } from "@/components/marketing-attribution";
import { calculateRental, type RentalCalculation } from "@/lib/rental";
import type { Car, Service } from "@/types/domain";

const addDays = (date: string, days: number) => {
  const parsed = parseDateOnly(date);
  if (!parsed) return date;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
};

const emptyCalculation: RentalCalculation = { days: 0, rentalPrice: 0, servicesPrice: 0, deposit: 0, dueWithoutDeposit: 0 };
const validInitialDate = (value: string | undefined, fallback: string) => value && parseDateOnly(value) ? value : fallback;

export function BookingForm({ cars, services, initialCarSlug, initialStart, initialEnd, initialServiceSlug }: { cars: Car[]; services: Service[]; initialCarSlug?: string; initialStart?: string; initialEnd?: string; initialServiceSlug?: string }) {
  const router = useRouter();
  const initialCar = cars.find((item) => item.slug === initialCarSlug);
  const today = todayInBusinessTimeZone();
  const maximumStartDate = addDays(today, RENTAL_POLICY.maximumAdvanceDays);
  const [carId, setCarId] = useState(initialCar?.id ?? "");
  const [startAt, setStartAt] = useState(validInitialDate(initialStart, today));
  const [endAt, setEndAt] = useState(validInitialDate(initialEnd, addDays(today, 1)));
  const [pickupMethod, setPickupMethod] = useState<"office" | "delivery">("office");
  const initialService = services.find((item) => item.slug === initialServiceSlug);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialService ? [initialService.id] : []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useRef(crypto.randomUUID());
  const bookingStarted = useRef(false);
  const selectedCar = cars.find((item) => item.id === carId);
  const policyProblem = selectedCar ? bookingPolicyProblem(selectedCar) : "Автомобиль не выбран";

  const calculation = useMemo(() => {
    if (!selectedCar) return emptyCalculation;
    try {
      return calculateRental({ startDate: startAt, endDate: endAt, pricePerDay: selectedCar.pricePerDay, deposit: selectedCar.deposit, servicePrices: services.filter((item) => selectedServices.includes(item.id)).map((item) => item.price ?? 0) });
    } catch {
      return emptyCalculation;
    }
  }, [startAt, endAt, selectedCar, selectedServices, services]);

  const minimumDaysMet = Boolean(selectedCar?.minimumRentalDays && calculation.days >= selectedCar.minimumRentalDays);
  const canSubmit = !policyProblem && minimumDaysMet && calculation.days <= RENTAL_POLICY.maximumRentalDays;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!canSubmit) { setError(policyProblem || "Проверьте срок аренды"); return; }
    setPending(true);
    setError("");
    const data = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    const storedAttribution = getMarketingAttribution();
    const utm = Object.fromEntries([...Object.entries(storedAttribution), ...[...params.entries()]].filter(([key]) => key.startsWith("utm_") || key === "yclid" || key === "rb_clickid").slice(0, 20));
    const payload = { carId, startAt, endAt, pickupMethod, deliveryAddress: String(data.get("deliveryAddress") ?? ""), customerName: String(data.get("customerName") ?? ""), phone: String(data.get("phone") ?? ""), telegram: String(data.get("telegram") ?? ""), additionalServiceIds: selectedServices, comment: String(data.get("comment") ?? ""), privacyConsent: true, utm, referrer: storedAttribution.referrer || document.referrer, idempotencyKey: idempotencyKey.current };
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok?: boolean; id?: string; message?: string; errors?: Record<string, string[]> };
      if (!response.ok) throw new Error(Object.values(result.errors ?? {}).flat()[0] || result.message || "Не удалось отправить обращение");
      window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "booking_submit", path: window.location.pathname, timestamp: Date.now() } }));
      trackVkLead("booking", result.id || idempotencyKey.current);
      router.push("/spasibo");
    } catch (caught) {
      window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "booking_submit_error", path: window.location.pathname, timestamp: Date.now() } }));
      setError(caught instanceof Error ? caught.message : "Не удалось отправить обращение");
    } finally { setPending(false); }
  };

  if (!selectedCar) return <div className="surface empty-state"><h2>Выберите автомобиль</h2><p className="subtitle">Откройте каталог или выберите модель из списка, чтобы перейти к датам и расчёту.</p><div className="field" style={{ maxWidth: 420, margin: "24px auto 0", textAlign: "left" }}><label htmlFor="carId">Автомобиль</label><select className="select" id="carId" value={carId} onChange={(event) => setCarId(event.target.value)}><option value="">Выберите автомобиль</option>{cars.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div><div className="button-row" style={{ justifyContent: "center", marginTop: 20 }}><Link className="button ghost" href="/cars">Открыть каталог</Link></div></div>;
  return <form className="booking-layout" onSubmit={submit} onFocusCapture={() => {
    if (bookingStarted.current) return;
    bookingStarted.current = true;
    window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "booking_form_start", path: window.location.pathname, timestamp: Date.now() } }));
  }} onClickCapture={(event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button[type="submit"]')) {
      window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "booking_submit_click", path: window.location.pathname, timestamp: Date.now() } }));
    }
  }} noValidate>
    <div className="surface booking-form">
      <section className="form-section"><h2>1. Автомобиль и даты</h2><p className="form-hint">Срок считается по календарным суткам: дата возврата не входит в оплачиваемый период.</p><div className="form-grid">
        <div className="field full"><label htmlFor="carId">Автомобиль</label><select className="select" id="carId" value={carId} onChange={(event) => setCarId(event.target.value)} data-event="booking_car_change">{cars.map((item) => { const reason = bookingPolicyProblem(item); return <option key={item.id} value={item.id}>{item.title}{reason ? `. ${reason}` : ""}</option>; })}</select></div>
        <div className="field"><label htmlFor="startAt">Дата начала</label><input className="input" id="startAt" type="date" value={startAt} min={today} max={maximumStartDate} onChange={(event) => setStartAt(event.target.value)} required data-event="date_check" data-event-label="booking_start" /></div>
        <div className="field"><label htmlFor="endAt">Дата возврата</label><input className="input" id="endAt" type="date" value={endAt} min={addDays(startAt, 1)} max={addDays(startAt, RENTAL_POLICY.maximumRentalDays)} onChange={(event) => setEndAt(event.target.value)} required data-event="date_check" data-event-label="booking_end" /></div>
      </div>{policyProblem ? null : <p className="form-hint booking-policy-hint">Минимальный срок: {selectedCar.minimumRentalDays} сут.; возраст от {Math.max(RENTAL_POLICY.legalAdultAge, selectedCar.minimumAge ?? 0)} лет; стаж от {selectedCar.minimumDrivingExperience} мес.</p>}</section>
      <section className="form-section"><h2>2. Получение автомобиля</h2><div className="form-grid"><label className="condition"><input type="radio" name="pickup" checked={pickupMethod === "office"} onChange={() => setPickupMethod("office")} /><span><strong>Самовывоз</strong><span className="muted small" style={{ display: "block", marginTop: 4 }}>Адрес подтвердит менеджер</span></span></label><label className="condition"><input type="radio" name="pickup" checked={pickupMethod === "delivery"} onChange={() => setPickupMethod("delivery")} /><span><strong>Доставка</strong><span className="muted small" style={{ display: "block", marginTop: 4 }}>Стоимость рассчитывается отдельно</span></span></label>{pickupMethod === "delivery" ? <div className="field full"><label htmlFor="deliveryAddress">Адрес доставки</label><input className="input" id="deliveryAddress" name="deliveryAddress" autoComplete="street-address" minLength={5} maxLength={300} required /></div> : null}</div></section>
      <section className="form-section"><h2>3. Контактные данные</h2><p className="form-hint">Возраст и водительский стаж менеджер уточнит при подтверждении заявки.</p><div className="form-grid"><div className="field"><label htmlFor="customerName">Имя <span aria-hidden="true">*</span></label><input className="input" id="customerName" name="customerName" autoComplete="name" required minLength={2} maxLength={100} /></div><div className="field"><label htmlFor="phone">Телефон <span aria-hidden="true">*</span></label><input className="input" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+7 999 123-45-67" inputMode="tel" pattern="[+0-9() \-]{7,30}" minLength={7} maxLength={30} title="Введите от 7 до 15 цифр; допустимы +, пробелы, скобки и дефисы" required /></div><div className="field"><label htmlFor="telegram">Telegram</label><input className="input" id="telegram" name="telegram" placeholder="@username" pattern="@?[A-Za-z0-9_]{5,32}" maxLength={33} /></div></div></section>
      <section className="form-section"><h2>4. Дополнительные услуги</h2><div className="grid-2">{services.filter((item) => item.slug !== "daily" && item.slug !== "long-term").map((service) => <label className="condition" key={service.id}><input type="checkbox" checked={selectedServices.includes(service.id)} onChange={() => setSelectedServices((current) => current.includes(service.id) ? current.filter((item) => item !== service.id) : [...current, service.id])} /><span><strong>{service.title}</strong><span className="muted small" style={{ display: "block", marginTop: 4 }}>{service.price ? formatPrice(service.price) : "Индивидуально"}</span></span></label>)}</div><div className="field" style={{ marginTop: 20 }}><label htmlFor="comment">Комментарий</label><textarea className="textarea" id="comment" name="comment" maxLength={1000} placeholder="Пожелания, удобное время для связи и другие детали" /></div></section>
      <section className="form-section"><label className="condition"><input type="checkbox" checked disabled aria-label="Согласие на обработку данных" /><span><strong>Согласие на обработку данных</strong><span className="muted small" style={{ display: "block", marginTop: 4 }}>Я ознакомился с <Link href="/privacy" target="_blank">политикой конфиденциальности</Link> и согласен передать данные для обработки обращения.</span></span></label></section>
      {error ? <p className="field-error" role="alert" style={{ marginTop: 20 }}>{error}</p> : null}
    </div>
    <aside className="surface summary"><div className="summary-image"><Image src={selectedCar.images[0]?.url ?? "/images/cars/porsche-911-carrera-4s/01.jpg"} alt={selectedCar.images[0]?.alt ?? selectedCar.title} fill preload sizes="380px" unoptimized={Boolean(selectedCar.images[0] && isYandexMediaUrl(selectedCar.images[0].url))} /></div><div className="summary-content"><span className="car-kicker">Сводка оформления</span><h2 className="car-title">{selectedCar.title}</h2><div className="summary-lines"><div className="summary-line"><span>Срок</span><strong>{calculation.days || "Не выбран"} сут.</strong></div><div className="summary-line"><span>Ставка</span><strong>{formatPrice(selectedCar.pricePerDay)} / сут.</strong></div><div className="summary-line"><span>Аренда</span><strong>{formatPrice(calculation.rentalPrice)}</strong></div><div className="summary-line"><span>Услуги</span><strong>{formatPrice(calculation.servicesPrice)}</strong></div><div className="summary-line"><span>Залог</span><strong>{formatDeposit(calculation.deposit)}</strong></div></div><div className="summary-total"><span>Предварительно</span><span>{formatPrice(calculation.dueWithoutDeposit)}</span></div><button className="button red" style={{ width: "100%", marginTop: 22 }} type="submit" disabled={pending || !canSubmit}>{pending ? <><LoaderCircle size={17} className="spin" /> Оформляем…</> : "Оформить машину"}</button><p className="muted small" style={{ display: "flex", gap: 8, marginTop: 16 }}><ShieldCheck size={16} /> Менеджер проверит даты, условия аренды и доступность автомобиля.</p></div></aside>
  </form>;
}
