import { CheckCircle2, MapPinned, Plus } from "lucide-react";
import { deleteLocationAction, saveLocationAction } from "@/app/admin/actions";
import { getStore } from "@/lib/data";
import type { Location } from "@/types/domain";
import { AdminMediaUploader } from "@/components/admin/admin-media-uploader";

export const metadata = { title: "Локации" };

type Props = { searchParams: Promise<{ saved?: string }> };

function LocationFields({ location, ownerId }: { location?: Location; ownerId: string }) {
  return <>
    <input type="hidden" name="id" value={ownerId} />
    <div className="form-grid">
      <div className="field"><label>Название</label><input className="input" name="title" defaultValue={location?.title} required /></div>
      <div className="field"><label>Slug</label><input className="input" name="slug" defaultValue={location?.slug} required /></div>
    </div>
    <div className="form-grid">
      <div className="field"><label>Короткая подпись</label><input className="input" name="subtitle" defaultValue={location?.subtitle} required /></div>
      <div className="field"><label>Порядок на сайте</label><input className="input" name="sortOrder" type="number" min="0" defaultValue={location?.sortOrder ?? 99} required /></div>
    </div>
    <div className="field full"><label>Фотографии</label><AdminMediaUploader name="images" ownerType="locations" ownerId={ownerId} initialImages={location?.images ?? []} mode="multiple" /></div>
    <div className="field"><label>Описание страницы</label><textarea className="textarea" name="description" defaultValue={location?.description} required /></div>
    <div className="form-grid">
      <div className="field"><label>Адрес</label><input className="input" name="address" defaultValue={location?.address ?? ""} /></div>
      <div className="field"><label>Часы работы</label><input className="input" name="workingHours" defaultValue={location?.workingHours ?? ""} /></div>
    </div>
    <div className="field full"><label>Ссылка на карту</label><input className="input" name="mapUrl" type="url" inputMode="url" placeholder="https://yandex.ru/maps/... или https://2gis.ru/..." defaultValue={location?.mapUrl ?? ""} /></div>
    <div className="field full"><label>Как добраться</label><textarea className="textarea" name="directions" defaultValue={location?.directions ?? ""} /></div>
    <details className="admin-content-editor">
      <summary><span><strong>Поисковая выдача</strong><small>Необязательные SEO-заголовок и описание</small></span><span>Открыть</span></summary>
      <div className="field"><label>SEO-заголовок</label><input className="input" name="seoTitle" defaultValue={location?.seoTitle ?? ""} /></div>
      <div className="field"><label>SEO-описание</label><textarea className="textarea" name="seoDescription" defaultValue={location?.seoDescription ?? ""} /></div>
    </details>
    <label className="checkbox"><input type="checkbox" name="published" defaultChecked={location?.published ?? true} /> Показывать на сайте</label>
  </>;
}

export default async function AdminLocationsPage({ searchParams }: Props) {
  const [query, store] = await Promise.all([searchParams, getStore()]);
  const locations = await store.getLocations({ includeHidden: true });
  const newLocationId = crypto.randomUUID();

  return <div className="admin-page"><div className="admin-container">
    <header className="admin-page-heading">
      <div><p className="admin-kicker">Маршруты и точки притяжения</p><h1>Локации</h1><p>Карточки на главной и отдельные страницы. Меньший номер показывается выше.</p></div>
      {query.saved ? <span className="admin-save-notice"><CheckCircle2 size={16} /> Изменения сохранены</span> : null}
    </header>

    <section className="admin-content-section">
      <header><span><MapPinned size={19} /></span><div><h2>Опубликованные и черновики</h2><p>{locations.length} позиций</p></div></header>
      <div className="admin-content-items">
        {locations.map((location) => <details key={location.id} className="admin-content-editor">
          <summary><span><strong>{location.title}</strong><small>#{location.sortOrder} · {location.published ? "На сайте" : "Черновик"}</small></span><span>Изменить</span></summary>
          <form action={saveLocationAction}>
            <LocationFields location={location} ownerId={location.id} />
            <div className="admin-editor-actions"><button className="button" type="submit">Сохранить</button><button className="button ghost" formAction={deleteLocationAction} type="submit">Удалить</button></div>
          </form>
        </details>)}
        <details className="admin-content-editor is-new">
          <summary><span><strong><Plus size={15} /> Новая локация</strong><small>Добавить карточку и отдельную страницу</small></span><span>Создать</span></summary>
          <form action={saveLocationAction}><LocationFields ownerId={newLocationId} /><button className="button red" type="submit">Добавить локацию</button></form>
        </details>
      </div>
    </section>
  </div></div>;
}
