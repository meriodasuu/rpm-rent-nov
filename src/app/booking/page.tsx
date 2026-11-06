import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getStore } from "@/lib/data";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = {
  title: "Оформление аренды автомобиля",
  description: "Выберите автомобиль и даты, посмотрите предварительный расчёт и отправьте обращение менеджеру RPM Rent.",
  alternates: { canonical: "/booking" },
  robots: { index: false, follow: true },
};

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ car?: string; start?: string; end?: string; service?: string }> }) {
  const [params, store] = await Promise.all([searchParams, getStore()]);
  const [cars, services] = await Promise.all([store.getCars(), store.getServices()]);
  return (
    <div className="page booking-page"><div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/cars" }, { label: "Оформление аренды" }]} />
      <header className="booking-intro-simple"><h1 className="title">Оформление аренды</h1></header>

      <BookingForm cars={cars} services={services} initialCarSlug={params.car} initialStart={params.start} initialEnd={params.end} initialServiceSlug={params.service} />

      <section className="booking-after surface"><div><h2>Что произойдёт после отправки</h2></div><div className="booking-after-list"><span><Check size={16} /> Менеджер проверит даты и доступность автомобиля.</span><span><Check size={16} /> Уточнит возраст, стаж и остальные детали.</span><span><Check size={16} /> Договор оформляется после согласования.</span></div><Link className="text-link" href="/rental-terms">Условия аренды</Link></section>
    </div></div>
  );
}
