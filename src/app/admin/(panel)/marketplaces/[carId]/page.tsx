import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getStore } from "@/lib/data";
import { isMarketplaceDatabaseConfigured, PrismaMarketplaceMonitoringRepository } from "@/lib/marketplace-monitoring/prisma-repository";
import styles from "../marketplace-monitoring.module.css";

const comparisonsSchema = z.array(z.object({
  fieldCode: z.enum(["PRICE", "PUBLICATION_STATUS", "TITLE"]),
  status: z.enum(["MATCH", "MISMATCH", "NOT_AVAILABLE", "IGNORED"]),
  severity: z.enum(["CRITICAL", "ERROR", "WARNING", "INFO"]),
  masterValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  externalValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
}));

const labels = { PRICE: "Цена за сутки", PUBLICATION_STATUS: "Статус публикации", TITLE: "Название" } as const;
const displayValue = (value: string | number | boolean | null) => {
  if (value === null) return "Недоступно";
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  if (typeof value === "number") return `${value.toLocaleString("ru-RU")} ₽`;
  return value;
};
const formatDateTime = (date: Date | null) => date
  ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Moscow" }).format(date)
  : "—";

export default async function MarketplaceCarDetailPage({ params }: { params: Promise<{ carId: string }> }) {
  const { carId } = await params;
  const car = (await (await getStore()).getCars({ includeHidden: true })).find((item) => item.id === carId);
  if (!car) notFound();
  if (!isMarketplaceDatabaseConfigured()) return <div className={styles.page}><div className={styles.container}><Link className={styles.back} href="/admin/marketplaces">← К сводке</Link><div className={styles.notice}>Для деталей мониторинга подключите PostgreSQL.</div></div></div>;
  const listing = await new PrismaMarketplaceMonitoringRepository().listingDetail(carId);
  if (!listing) notFound();
  const parsed = comparisonsSchema.safeParse(listing.snapshots[0]?.comparisonData);
  const comparisons = parsed.success ? parsed.data : [];

  return <div className={styles.page}>
    <div className={styles.container}>
      <Link className={styles.back} href="/admin/marketplaces">← К контролю площадок</Link>
      <header className={styles.heading}><div><p className={styles.kicker}>Avito #{listing.externalId}</p><h1>{car.title}</h1><p>Последняя проверка: {formatDateTime(listing.lastCheckedAt)}</p></div>{listing.externalUrl ? <a href={listing.externalUrl} target="_blank" rel="noreferrer">Открыть объявление ↗</a> : null}</header>

      <section className={styles.panel}>
        <h2>Последняя сверка</h2>
        {comparisons.length ? <table className={styles.comparisonTable}><thead><tr><th>Поле</th><th>RPM Rent</th><th>Avito</th><th>Результат</th></tr></thead><tbody>{comparisons.map((item) => <tr key={item.fieldCode}><td>{labels[item.fieldCode]}</td><td>{displayValue(item.masterValue)}</td><td>{displayValue(item.externalValue)}</td><td><strong>{item.status}</strong><small>{item.severity}</small></td></tr>)}</tbody></table> : <p>Успешной проверки пока нет.</p>}
      </section>

      <section className={styles.panel}>
        <h2>История расхождений</h2>
        {listing.discrepancies.length ? <div className={styles.history}>{listing.discrepancies.map((item) => <article key={item.id}><strong>{labels[item.fieldCode as keyof typeof labels] ?? item.fieldCode} · {item.severity} · {item.status}</strong><p>RPM: {displayValue(item.masterValue)} · Avito: {displayValue(item.externalValue)}</p><small>Впервые: {formatDateTime(item.firstDetectedAt)} · Последний раз: {formatDateTime(item.lastDetectedAt)}{item.resolvedAt ? ` · Исправлено: ${formatDateTime(item.resolvedAt)}` : ""}</small></article>)}</div> : <p>Расхождений не зафиксировано.</p>}
      </section>
    </div>
  </div>;
}
