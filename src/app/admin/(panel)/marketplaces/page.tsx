import Link from "next/link";
import { getStore } from "@/lib/data";
import { buildMarketplaceDashboardRows, type MarketplaceDashboardStatus } from "@/lib/marketplace-monitoring/view-model";
import { isMarketplaceDatabaseConfigured, PrismaMarketplaceMonitoringRepository } from "@/lib/marketplace-monitoring/prisma-repository";
import { isAvitoConfigured } from "@/lib/marketplaces/avito/client";
import { MarketplaceLinkForm, MarketplaceRefreshForm, MarketplaceUnlinkForm } from "@/components/admin/marketplace-actions";
import styles from "./marketplace-monitoring.module.css";

export const metadata = { title: "Контроль площадок" };

const formatDateTime = (date: Date | null) => date
  ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Moscow" }).format(date)
  : "Не проверялось";

const badgeClass = (status: MarketplaceDashboardStatus) => ({
  OK: styles.ok,
  WARNING: styles.warning,
  ERROR: styles.error,
  CRITICAL: styles.critical,
  "NOT LINKED": styles.notLinked,
  "CHECK FAILED": styles.failed,
})[status];

export default async function AdminMarketplacesPage() {
  const cars = await (await getStore()).getCars({ includeHidden: true });
  const databaseConfigured = isMarketplaceDatabaseConfigured();
  const dashboard = databaseConfigured
    ? await new PrismaMarketplaceMonitoringRepository().dashboard()
    : { marketplace: null, listings: [], latestRun: null };
  const rows = buildMarketplaceDashboardRows(cars, dashboard.listings);
  const connectorConfigured = isAvitoConfigured();

  return <div className={styles.page}>
    <div className={styles.container}>
      <header className={styles.heading}>
        <div>
          <p className={styles.kicker}>Контроль публикаций</p>
          <h1>Контроль площадок</h1>
          <p>Сверка цены, названия и статуса публикации RPM Rent с объявлениями Avito.</p>
        </div>
        <MarketplaceRefreshForm disabled={!databaseConfigured || !connectorConfigured} />
      </header>

      <div className={styles.health} aria-label="Состояние интеграции">
        <span className={connectorConfigured ? styles.available : styles.unavailable}>Avito API: {connectorConfigured ? "настроен" : "NOT_CONFIGURED"}</span>
        <span className={databaseConfigured ? styles.available : styles.unavailable}>Хранилище: {databaseConfigured ? "PostgreSQL" : "не подключено"}</span>
        <span>Последний запуск: {dashboard.latestRun ? `${dashboard.latestRun.status} · ${formatDateTime(dashboard.latestRun.startedAt)}` : "нет"}</span>
      </div>

      {!databaseConfigured ? <div className={styles.notice} role="alert">Мониторинг площадок работает только с PostgreSQL. Основной сайт продолжает использовать настроенное файловое хранилище, но история проверок и связей недоступна.</div> : null}
      {!connectorConfigured ? <div className={styles.notice} role="alert">Добавьте серверные переменные AVITO_CLIENT_ID и AVITO_CLIENT_SECRET. Секреты не передаются в браузер.</div> : null}

      {rows.length ? <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Автомобиль RPM</th><th>Объявление</th><th>Состояние</th><th>Проверка</th><th>Действия</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}>
            <td><strong>{row.title}</strong><small>{row.pricePerDay.toLocaleString("ru-RU")} ₽/сут. · {row.published ? "опубликован" : "скрыт"}</small></td>
            <td>{row.externalId ? <>{row.externalUrl ? <a href={row.externalUrl} target="_blank" rel="noreferrer">Avito #{row.externalId}</a> : <strong>Avito #{row.externalId}</strong>}<small>{row.mismatchCount} открытых расхождений</small></> : <span>Не привязано</span>}</td>
            <td><span className={`${styles.badge} ${badgeClass(row.status)}`}>{row.status}</span><small>{row.statusDetail}</small></td>
            <td>{formatDateTime(row.lastCheckedAt)}</td>
            <td className={styles.rowActions}>{row.listingId
              ? <><Link href={`/admin/marketplaces/${row.id}`}>Открыть детали</Link><MarketplaceUnlinkForm carId={row.id} listingId={row.listingId} /></>
              : databaseConfigured && connectorConfigured ? <MarketplaceLinkForm carId={row.id} /> : <small>Сначала настройте интеграцию</small>}
            </td>
          </tr>)}</tbody>
        </table>
      </div> : <div className={styles.empty}>В автопарке пока нет автомобилей.</div>}
    </div>
  </div>;
}
