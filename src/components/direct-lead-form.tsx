"use client";

import { LoaderCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { trackVkLead } from "@/lib/vk-pixel";
import { getMarketingAttribution } from "@/components/marketing-attribution";

type DirectLeadFormProps = { car: { id: string; title: string; pricePerDay: number }; initialStart: string };

const formatPhone = (value: string) => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = `7${digits.slice(1)}`;
  if (digits.startsWith("7")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return "";
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean);
  return `+7 ${parts[0] ?? ""}${parts[1] ? ` ${parts[1]}` : ""}${parts[2] ? `-${parts[2]}` : ""}${parts[3] ? `-${parts[3]}` : ""}`;
};

export function DirectLeadForm({ car, initialStart }: DirectLeadFormProps) {
  const router = useRouter();
  const [startAt, setStartAt] = useState(initialStart);
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useRef(crypto.randomUUID());
  const started = useRef(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "direct_lead_open" } }));
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) { event.currentTarget.reportValidity(); return; }
    setPending(true); setError("");
    const attribution = getMarketingAttribution();
    const queryAttribution = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries([
      ...Object.entries(attribution).filter(([key]) => key.startsWith("utm_") || key === "yclid" || key === "rb_clickid"),
      ...[...queryAttribution.entries()].filter(([key]) => key.startsWith("utm_") || key === "yclid" || key === "rb_clickid")
    ]);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        carId: car.id, startAt, phone, privacyConsent: true, utm, landingPath: attribution.landingPath || window.location.pathname,
        referrer: attribution.referrer || document.referrer, idempotencyKey: idempotencyKey.current
      }) });
      const result = await response.json() as { id?: string; message?: string; errors?: Record<string, string[]> };
      if (!response.ok) throw new Error(Object.values(result.errors ?? {}).flat()[0] || result.message || "Не удалось отправить заявку");
      window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "direct_lead_submit" } }));
      trackVkLead("lead", result.id || idempotencyKey.current);
      router.push("/spasibo");
    } catch (caught) {
      window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "direct_lead_submit_error" } }));
      setError(caught instanceof Error ? caught.message : "Не удалось отправить заявку");
    } finally { setPending(false); }
  };

  return <form id="direct-lead" className="surface direct-lead-form" onSubmit={submit} onFocusCapture={() => {
    if (started.current) return;
    started.current = true;
    window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "direct_lead_start" } }));
  }}>
    <header className="direct-lead-header">
      <span className="direct-lead-eyebrow">Заявка на аренду</span>
      <p className="direct-lead-car">{car.title}</p>
      <strong className="direct-lead-price">от {new Intl.NumberFormat("ru-RU").format(car.pricePerDay)} ₽ <span>/ сутки</span></strong>
      <p className="direct-lead-intro">Оставьте телефон — менеджер свяжется и уточнит детали аренды.</p>
    </header>
    <div className="direct-lead-fields">
      <div className="field"><label htmlFor="direct-start">Дата начала</label><input className="input" id="direct-start" type="date" value={startAt} min={initialStart} onChange={(event) => setStartAt(event.target.value)} required /></div>
      <div className="field"><label htmlFor="direct-phone">Телефон для связи</label><input className="input" id="direct-phone" type="tel" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} inputMode="tel" autoComplete="tel" placeholder="+7 999 123-45-67" pattern="[+0-9() \-]{7,30}" minLength={7} maxLength={30} required /></div>
    </div>
    <label className="direct-lead-consent"><input type="checkbox" required /> <span>Соглашаюсь на обработку персональных данных для связи по заявке.</span></label>
    {error ? <p className="field-error" role="alert">{error}</p> : null}
    <button className="button red" type="submit" disabled={pending}>{pending ? <><LoaderCircle size={17} className="spin" /> Отправляем…</> : <><Phone size={17} /> Получить предложение</>}</button>
    <p className="direct-lead-note">Отправка формы не является бронированием.</p>
  </form>;
}
