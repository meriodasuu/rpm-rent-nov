import Link from "next/link";
import { ArrowRight, CalendarCheck, CarFront, Clock3, Inbox, KeyRound, RotateCcw } from "lucide-react";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { getStore } from "@/lib/data";
import {
  buildCalendarDays,
  filterAdminBookings,
  getAdminSummary,
  getBookingAgeLabel,
} from "@/lib/admin-operations";
import { formatRentalDate } from "@/lib/format";

export default async function AdminDashboard() {
  const store = await getStore();
  const now = new Date();
  const [cars, bookings] = await Promise.all([
    store.getCars({ includeHidden: true }),
    store.getBookings(),
  ]);
  const summary = getAdminSummary(bookings, cars, now);
  const attention = filterAdminBookings(bookings, "attention", "", now).slice(0, 6);
  const today = buildCalendarDays(now, 1)[0]?.key;
  const pickups = bookings.filter((item) => item.status === "CONFIRMED" && item.startAt.slice(0, 10) === today);
  const returns = bookings.filter((item) => item.status === "CONFIRMED" && item.endAt.slice(0, 10) === today);
  const dateLabel = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  return (
    <div className="admin-page admin-dashboard">
      <div className="admin-container">
        <header className="admin-page-heading">
          <div>
            <p className="admin-kicker">Операционный центр</p>
            <h1>Сегодня</h1>
            <p>{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} · Москва</p>
          </div>
          <Link className="admin-primary-action" href="/admin/bookings">
            Открыть заявки <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </header>

        <section className="admin-summary-grid" aria-label="Сводка на сегодня">
          <Link className="admin-summary-card is-alert" href="/admin/bookings?filter=attention">
            <span><Inbox aria-hidden="true" size={18} /> Требуют внимания</span>
            <strong>{summary.attention}</strong>
            <small>новые и в обработке</small>
          </Link>
          <Link className="admin-summary-card" href="/admin/bookings?filter=today">
            <span><KeyRound aria-hidden="true" size={18} /> Выдачи сегодня</span>
            <strong>{summary.pickupsToday}</strong>
            <small>подтверждённых бронирований</small>
          </Link>
          <Link className="admin-summary-card" href="/admin/bookings?filter=today">
            <span><RotateCcw aria-hidden="true" size={18} /> Возвраты сегодня</span>
            <strong>{summary.returnsToday}</strong>
            <small>нужно принять автомобили</small>
          </Link>
          <Link className="admin-summary-card" href="/admin/calendar">
            <span><CarFront aria-hidden="true" size={18} /> Свободно сейчас</span>
            <strong>{summary.availableCars}</strong>
            <small>{summary.occupiedCars} автомобилей занято</small>
          </Link>
        </section>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-panel-icon"><Inbox aria-hidden="true" size={18} /></span>
                <h2>Очередь обработки</h2>
              </div>
              <Link href="/admin/bookings?filter=attention">Все заявки</Link>
            </div>
            {attention.length ? (
              <div className="admin-request-list">
                {attention.map((booking) => (
                  <Link key={booking.id} href={`/admin/bookings?booking=${booking.id}`} className="admin-request-row">
                    <span className="admin-request-customer">
                      <strong>{booking.customerName}</strong>
                      <small>{booking.phone}</small>
                    </span>
                    <span className="admin-request-car">
                      <strong>{booking.carTitle}</strong>
                      <small>{formatRentalDate(booking.startAt)} — {formatRentalDate(booking.endAt)}</small>
                    </span>
                    <BookingStatusBadge status={booking.status} />
                    <span className="admin-request-age"><Clock3 aria-hidden="true" size={14} /> {getBookingAgeLabel(booking, now)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="admin-panel-empty"><CalendarCheck size={25} /><strong>Очередь разобрана</strong><span>Новых заявок, требующих внимания, нет.</span></div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-panel-icon"><CalendarCheck aria-hidden="true" size={18} /></span>
                <h2>Движение сегодня</h2>
              </div>
              <Link href="/admin/calendar">Календарь</Link>
            </div>
            {pickups.length + returns.length ? (
              <div className="admin-agenda-list">
                {pickups.map((booking) => (
                  <Link key={`pickup-${booking.id}`} href={`/admin/bookings?booking=${booking.id}`}>
                    <span className="admin-agenda-mark is-pickup"><KeyRound size={15} /></span>
                    <span><small>Выдача</small><strong>{booking.carTitle}</strong><em>{booking.customerName}</em></span>
                  </Link>
                ))}
                {returns.map((booking) => (
                  <Link key={`return-${booking.id}`} href={`/admin/bookings?booking=${booking.id}`}>
                    <span className="admin-agenda-mark is-return"><RotateCcw size={15} /></span>
                    <span><small>Возврат</small><strong>{booking.carTitle}</strong><em>{booking.customerName}</em></span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="admin-panel-empty"><CarFront size={25} /><strong>Спокойный день</strong><span>Подтверждённых выдач и возвратов сегодня нет.</span></div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
