import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList } from "@/components/faq-list";
import { getStore } from "@/lib/data";
import { serializeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Вопросы об аренде", description: "Расчёт стоимости, проверка дат, залог, получение автомобиля и подтверждение обращения.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const faqs = await (await getStore()).getFaqs();
  return <div className="page"><div className="container">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer } }))
    }) }} />
    <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Вопросы" }]} />
    <div className="page-intro"><div><p className="eyebrow">Перед арендой</p><h1 className="title">Ответы на вопросы до оформления</h1></div><p className="subtitle">Здесь собраны общие правила процесса. Требования к возрасту, стажу, пробегу и страхованию зависят от конкретного автомобиля и публикуются в его карточке.</p></div>
    <FaqList items={faqs} />
    <section className="cta-panel"><div className="cta-content"><p className="eyebrow">Не нашли ответ?</p><h2 className="title">Свяжитесь по конкретному автомобилю</h2><p className="subtitle">Укажите модель, период и контакты. Мы проверим доступность и применимые условия до оформления.</p><div className="button-row"><Link className="button red" href="/booking">Перейти к оформлению <ArrowRight size={17} /></Link><Link className="button cta-secondary" href="/rental-terms">Все условия</Link></div></div></section>
  </div></div>;
}
