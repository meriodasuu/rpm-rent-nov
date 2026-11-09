import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LocationGallery } from "@/components/location-gallery";
import { getStore } from "@/lib/data";
import { socialPreviewImage } from "@/config/social-preview";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = await (await getStore()).getLocationBySlug(slug);
  if (!location) return { title: "Локация не найдена" };
  const title = (location.seoTitle ?? location.title)
    .replace(/\s*(?:\||[—–-])\s*RPM Rent\s*$/i, "")
    .trim() || location.title;
  return {
    title,
    description: location.seoDescription || location.description,
    alternates: { canonical: `/locations/${location.slug}` },
    openGraph: { images: [socialPreviewImage] }
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = await (await getStore()).getLocationBySlug(slug);
  if (!location) notFound();

  return <main className="page">
    <div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Локации", href: "/#locations" }, { label: location.title }]} />
      <section className="surface" style={{ overflow: "hidden", padding: 0 }}>
        <LocationGallery images={location.images} title={location.title} subtitle={location.subtitle} />
        <div style={{ padding: "clamp(24px, 5vw, 64px)", display: "grid", gap: 28 }}>
          <p className="subtitle" style={{ maxWidth: 760 }}>{location.description}</p>
          {(location.address || location.workingHours || location.directions || location.mapUrl) && <section aria-label="Информация о локации" style={{ display: "grid", gap: 14, maxWidth: 760, padding: 24, border: "1px solid var(--line)", borderRadius: 6 }}>
            {location.address && <div><strong>Адрес</strong><p>{location.address}</p></div>}
            {location.workingHours && <div><strong>Часы работы</strong><p>{location.workingHours}</p></div>}
            {location.directions && <div><strong>Как добраться</strong><p>{location.directions}</p></div>}
            {location.mapUrl && <div><a className="button ghost" href={location.mapUrl} target="_blank" rel="noreferrer">Открыть карту</a></div>}
          </section>}
          <div className="button-row"><Link className="button red" href="/cars">Выбрать автомобиль <ArrowRight size={18} /></Link><Link className="button ghost" href="/contacts">Связаться с нами</Link></div>
        </div>
      </section>
    </div>
  </main>;
}
