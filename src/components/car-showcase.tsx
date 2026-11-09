import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { isYandexMediaUrl } from "@/lib/yandex-public-media";
import type { Car } from "@/types/domain";

export function CarShowcase({ cars }: { cars: Car[] }) {
  if (!cars.length) return <div className="showcase-empty">Автомобили скоро появятся в каталоге.</div>;

  return (
    <section className="car-showcase" aria-label="Автомобили RPM Rent">
      <div className="showcase-track">
        {cars.slice(0, 3).map((car, index) => {
          const image = car.images[0];
          const specs = [car.bodyType, car.horsepower ? `${car.horsepower} л.с.` : null, car.driveType].filter(Boolean);
          return (
            <article className={`showcase-card ${index === 0 ? "showcase-card-featured" : ""}`} key={car.id}>
              <Link href={`/cars/${car.slug}`} aria-label={`Открыть ${car.title}`}>
                {image ? <Image alt={image.alt} fill loading={index < 2 ? "eager" : "lazy"} sizes={index === 0 ? "(max-width:760px) 92vw, 58vw" : "(max-width:760px) 92vw, 31vw"} src={image.url} unoptimized={isYandexMediaUrl(image.url)} /> : <span className="showcase-image-missing">Фото готовится</span>}
                <span className="showcase-gradient" />
                <span className="showcase-meta">
                  <span className="showcase-index">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{car.title}</strong>
                  <span className="showcase-specs">{specs.map((spec) => <span key={spec}>{spec}</span>)}</span>
                  <span className="showcase-open">Смотреть авто <ArrowRight size={14} /></span>
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
