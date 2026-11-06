"use client";

import { ChevronLeft, ChevronRight, MapPinned } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { isYandexMediaUrl } from "@/lib/yandex-public-media";

export function LocationGallery({ images, title, subtitle }: { images: string[]; title: string; subtitle: string }) {
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const safeActive = active < images.length ? active : 0;
  const current = images[safeActive];
  const move = useCallback((direction: number) => setActive((index) => (index + direction + images.length) % images.length), [images.length]);

  if (!current) return null;

  return <div
    className="location-gallery"
    onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
    onTouchEnd={(event) => {
      if (touchStart.current === null) return;
      const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
      if (Math.abs(delta) > 45 && images.length > 1) move(delta > 0 ? -1 : 1);
      touchStart.current = null;
    }}
  >
    <Image src={current} alt={`${title}, фото ${safeActive + 1}`} fill priority={safeActive === 0} sizes="(max-width:760px) 100vw, 1180px" unoptimized={isYandexMediaUrl(current)} />
    <div className="location-gallery-shade" />
    <div className="location-gallery-copy">
      <p className="eyebrow"><MapPinned size={15} /> {subtitle}</p>
      <h1 className="display">{title}</h1>
    </div>
    {images.length > 1 ? <>
      <button className="location-gallery-control is-prev" type="button" aria-label="Предыдущее фото" onClick={() => move(-1)}><ChevronLeft size={22} /></button>
      <button className="location-gallery-control is-next" type="button" aria-label="Следующее фото" onClick={() => move(1)}><ChevronRight size={22} /></button>
      <div className="location-gallery-dots" role="tablist" aria-label={`Фотографии ${title}`}>
        {images.map((image, index) => <button key={`${image}-${index}`} className={index === safeActive ? "is-active" : ""} type="button" role="tab" aria-selected={index === safeActive} aria-label={`Фото ${index + 1}`} onClick={() => setActive(index)} />)}
      </div>
      <span className="location-gallery-counter">{String(safeActive + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
    </> : null}
  </div>;
}
