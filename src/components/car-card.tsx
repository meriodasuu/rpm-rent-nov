import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { bookingPolicyProblem } from "@/lib/domain/booking";
import { formatPrice } from "@/lib/format";
import { isYandexMediaUrl } from "@/lib/yandex-public-media";
import type { Car } from "@/types/domain";

export function CarCard({ car, eager = false, period, periodAvailable }: { car: Car; eager?: boolean; period?: { start?: string; end?: string }; periodAvailable?: boolean }) {
  const image = car.images[0];
  const query = period?.start && period?.end ? `?start=${encodeURIComponent(period.start)}&end=${encodeURIComponent(period.end)}` : "";
  const detail = `/cars/${car.slug}${query}`;
  const booking = `/booking?car=${car.slug}${query ? `&${query.slice(1)}` : ""}`;
  const policyProblem = bookingPolicyProblem(car);
  const busyForPeriod = periodAvailable === false && !policyProblem;
  const bookable = !policyProblem && !busyForPeriod;
  const availabilityText = policyProblem
    ? policyProblem
    : busyForPeriod
      ? "Занят на выбранные даты. Измените период"
      : periodAvailable === true
        ? "Свободен на выбранные даты"
        : "Выберите даты для проверки";
  return (
    <article className="car-card">
      <Link href={detail} aria-label={`Подробнее: ${car.title}`} data-event="car_card_open" data-event-label={car.slug}><div className="car-image">{image ? <Image src={image.url} alt={image.alt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" loading={eager ? "eager" : "lazy"} unoptimized={isYandexMediaUrl(image.url)} /> : null}<div className="car-tags">{car.isNew ? <span className="tag">Новинка</span> : null}{car.isPromotion ? <span className="tag red">Спецусловие</span> : null}{busyForPeriod ? <span className="tag">Занят на даты</span> : null}</div><span className="car-image-index">RPM / {car.brand}</span></div></Link>
      <div className="car-content"><span className="car-kicker">{car.vehicleClass} · {car.bodyType}</span><h3 className="car-title"><Link href={detail} data-event="car_card_open" data-event-label={car.slug}>{car.title}</Link></h3><div className="car-specs">{car.year ? <span>{car.year}</span> : null}{car.transmission ? <span>{car.transmission}</span> : null}{car.driveType ? <span>{car.driveType}</span> : null}</div><div className="car-footer"><div><div className="price">{formatPrice(car.pricePerDay)} <small>/ сутки</small></div><span className="availability-note">{availabilityText}</span></div><Link className="button small-button" href={bookable ? booking : detail} data-event={bookable ? "booking_open" : "car_card_open"} data-event-label={car.slug}>{bookable ? <>Оформить <ArrowRight size={15} /></> : <>Подробнее <ArrowRight size={15} /></>}</Link></div></div>
    </article>
  );
}
