import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { buildCalendarDays, bookingOccupiesDay } from "@/lib/admin-operations";
import { getStore } from "@/lib/data";

export const metadata = { title: "Календарь" };

export default async function AdminCalendarPage() {
  const store = await getStore();
  const [cars, bookings] = await Promise.all([
    store.getCars({ includeHidden: true }),
    store.getBookings(),
  ]);
  const days = buildCalendarDays(new Date(), 14);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-page-heading">
          <div>
            <p className="admin-kicker">Планирование автопарка</p>
            <h1>Календарь</h1>
            <p>Занятость автомобилей на ближайшие 14 дней.</p>
          </div>
          <div className="admin-calendar-legend" aria-label="Обозначения">
            <span><i className="is-confirmed" /> Подтверждено</span>
            <span><i className="is-pending" /> Ожидает решения</span>
          </div>
        </header>

        {cars.length ? (
          <div className="admin-calendar-shell">
            <table className="admin-calendar">
              <thead>
                <tr>
                  <th scope="col">Автомобиль</th>
                  {days.map((day) => (
                    <th key={day.key} scope="col" className={day.isToday ? "is-today" : undefined}>
                      <span>{day.weekday}</span>
                      <strong>{day.day}</strong>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id}>
                    <th scope="row">
                      <Link href={`/admin/cars/${car.id}`}>{car.title}</Link>
                      <span>{car.available ? (car.published ? "На сайте" : "Скрыт") : "Недоступен"}</span>
                    </th>
                    {days.map((day) => {
                      const booking = bookings.find((item) => item.carId === car.id && bookingOccupiesDay(item, day.key));
                      return (
                        <td key={day.key} className={day.isToday ? "is-today" : undefined}>
                          {booking ? (
                            <Link
                              className={`admin-calendar-booking ${booking.status === "CONFIRMED" ? "is-confirmed" : "is-pending"}`}
                              href={`/admin/bookings?booking=${booking.id}`}
                              title={`${booking.customerName} · ${booking.carTitle}`}
                              aria-label={`${booking.carTitle}, ${booking.customerName}`}
                            >
                              <span>{booking.customerName.split(" ")[0]}</span>
                            </Link>
                          ) : <span className="admin-calendar-free" aria-label="Свободно" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-panel-empty admin-panel"><CalendarDays size={28} /><strong>Автопарк пуст</strong><span>Добавьте первый автомобиль, чтобы начать планирование.</span></div>
        )}
      </div>
    </div>
  );
}
