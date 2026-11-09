import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Section = { title: string; content: ReactNode };

export function LegalPolicyPage({ title, intro, sections }: { title: string; intro: string; sections: Section[] }) {
  return (
    <div className="page">
      <div className="narrow">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: title }]} />
        <div className="page-intro" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <p className="eyebrow">Юридическая информация</p>
            <h1 className="title">{title}</h1>
            <p className="subtitle">{intro}</p>
            <p className="muted small">Редакция от 14 августа 2026 года</p>
          </div>
        </div>
        <article className="surface content-card rich-text">
          {sections.map((section, index) => <section key={section.title}><h2>{index + 1}. {section.title}</h2>{section.content}</section>)}
        </article>
      </div>
    </div>
  );
}
