"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { isYandexMediaUrl } from "@/lib/yandex-public-media";

type GalleryImage = { url: string; alt: string };

export function CarGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStart = useRef<number | null>(null);
  const current = images[active];

  const move = useCallback((direction: number) => {
    setActive((index) => (index + direction + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    document.body.classList.add("gallery-open");
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("gallery-open");
      window.removeEventListener("keydown", handleKey);
    };
  }, [expanded, move]);

  if (!current) return null;

  const stage = (
    <div
      className="gallery-stage"
      onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1);
        touchStart.current = null;
      }}
    >
      <Image src={current.url} alt={current.alt} fill loading={active === 0 ? "eager" : "lazy"} sizes="(max-width: 760px) 100vw, 70vw" unoptimized={isYandexMediaUrl(current.url)} />
      {images.length > 1 ? <>
        <button className="gallery-control gallery-prev" type="button" aria-label="Предыдущее фото" onClick={() => move(-1)} data-event="car_gallery_interaction" data-event-label="previous"><ChevronLeft size={21} /></button>
        <button className="gallery-control gallery-next" type="button" aria-label="Следующее фото" onClick={() => move(1)} data-event="car_gallery_interaction" data-event-label="next"><ChevronRight size={21} /></button>
      </> : null}
      <button className="gallery-expand" type="button" onClick={() => setExpanded(true)} data-event="car_gallery_interaction" data-event-label="fullscreen"><Expand size={17} /> Открыть</button>
      <span className="gallery-counter" aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
    </div>
  );

  return <>
    <div className="gallery-experience">
      {stage}
      <div className="gallery-thumbs" role="tablist" aria-label={`Фотографии ${title}`}>
        {images.map((image, index) => <button className={index === active ? "active" : ""} type="button" role="tab" aria-selected={index === active} aria-label={`Фото ${index + 1}`} key={image.url} onClick={() => setActive(index)} data-event="car_gallery_interaction" data-event-label="thumbnail"><Image src={image.url} alt="" fill sizes="120px" unoptimized={isYandexMediaUrl(image.url)} /></button>)}
      </div>
    </div>
    {expanded ? <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Галерея ${title}`}>
      <button className="gallery-lightbox-close" type="button" aria-label="Закрыть галерею" onClick={() => setExpanded(false)}><X size={24} /></button>
      {stage}
    </div> : null}
  </>;
}
