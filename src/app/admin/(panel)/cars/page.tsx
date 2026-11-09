import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CarFront, Plus } from "lucide-react";
import { getStore } from "@/lib/data";
import { formatDeposit, formatPrice, formatRentalDate } from "@/lib/format";
import { getNextActiveBooking } from "@/lib/admin-operations";
import { isYandexMediaUrl } from "@/lib/yandex-public-media";

export const metadata = { title: "Автопарк" };

export default async function AdminCarsPage() {
  const store = await getStore();
  const now = new Date();
  const [cars, bookings] = await Promise.all([
    store.getCars({ includeHidden: true }),
    store.getBookings(),
  ]);
  const published = cars.filter((car) => car.published).length;
  const ready = cars.filter((car) => car.published && car.available && !car.isDemo).length;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-page-heading">
          <div>
            <p className="admin-kicker">Единый источник данных</p>
            <h1>Автопарк</h1>
            <p>{cars.length} автомобилей · {published} опубликовано · {ready} готовы к заявкам</p>
          </div>
          <Link className="admin-primary-action" href="/admin/cars/new"><Plus size={17} /> Добавить автомобиль</Link>
        </header>

        {cars.length ? (
          <div className="admin-fleet-list">
            {cars.map((car) => {
              const nextBooking = getNextActiveBooking(bookings, car.id, now);
              return (
                <article key={car.id} className="admin-fleet-row">
                  <div className="admin-fleet-image">
                    {car.images[0] ? <Image src={car.images[0].url} alt="" fill sizes="112px" unoptimized={isYandexMediaUrl(car.images[0].url)} /> : <CarFront aria-hidden="true" size={25} />}
                  </div>
                  <div className="admin-fleet-name">
                    <strong>{car.title}</strong>
                    <span>{car.vehicleClass} · {car.year ?? "год не указан"}</span>
                  </div>
                  <div className="admin-fleet-price"><small>Ставка</small><strong>{formatPrice(car.pricePerDay)} / сут.</strong><span>Залог {formatDeposit(car.deposit)}</span></div>
                  <div className="admin-fleet-state">
                    <small>Статус</small>
                    <span className={`admin-fleet-pill ${car.published && car.available ? "is-ready" : "is-muted"}`}>{car.published ? (car.available ? "Доступен" : "Недоступен") : "Скрыт"}</span>
                    {car.isDemo ? <span className="admin-fleet-warning">Нужно проверить данные</span> : null}
                  </div>
                  <div className="admin-fleet-next">
                    <small>Ближайшая заявка</small>
                    {nextBooking ? <><strong>{formatRentalDate(nextBooking.startAt)}</strong><span>{nextBooking.customerName}</span></> : <span>Нет активных заявок</span>}
                  </div>
                  <Link className="admin-fleet-edit" href={`/admin/cars/${car.id}`} aria-label={`Редактировать ${car.title}`}><ArrowRight size={18} /></Link>
                </article>
              );
            })}
          </div>
        ) : <div className="admin-panel admin-panel-empty"><CarFront size={28} /><strong>Автопарк пуст</strong><span>Добавьте первый автомобиль.</span></div>}
      </div>
    </div>
  );
}
