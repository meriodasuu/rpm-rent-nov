import { AlertTriangle, BadgeRussianRuble, CarFront, FileImage, Save, Settings2 } from "lucide-react";
import { saveCarAction } from "@/app/admin/actions";
import { RENTAL_POLICY } from "@/config/rental-policy";
import { VEHICLE_CLASSES } from "@/lib/vehicle-class";
import type { Car } from "@/types/domain";
import { AdminMediaUploader } from "./admin-media-uploader";

const TextField = ({ name, label, value, type = "text", min, max, required = false, hint }: { name: string; label: string; value: string | number | null; type?: string; min?: number; max?: number; required?: boolean; hint?: string }) => (
  <div className="field"><label htmlFor={name}>{label}{required ? <span aria-hidden="true"> *</span> : null}</label><input className="input" id={name} name={name} type={type} min={min} max={max} defaultValue={value ?? ""} required={required} />{hint ? <small>{hint}</small> : null}</div>
);

const TextArea = ({ name, label, value, placeholder, required = false, hint }: { name: string; label: string; value: string; placeholder?: string; required?: boolean; hint?: string }) => (
  <div className="field full"><label htmlFor={name}>{label}{required ? <span aria-hidden="true"> *</span> : null}</label><textarea className="textarea" id={name} name={name} defaultValue={value} placeholder={placeholder} required={required} />{hint ? <small>{hint}</small> : null}</div>
);

const VehicleClassField = ({ value }: { value: string }) => (
  <div className="field"><label htmlFor="vehicleClass">Класс<span aria-hidden="true"> *</span></label><select className="select" id="vehicleClass" name="vehicleClass" defaultValue={value} required>{VEHICLE_CLASSES.map((vehicleClass) => <option key={vehicleClass} value={vehicleClass}>{vehicleClass}</option>)}</select></div>
);

function FormSection({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return <section className="admin-form-section"><header><span>{icon}</span><div><h2>{title}</h2><p>{description}</p></div></header><div className="admin-form-section-body">{children}</div></section>;
}

export function CarForm({ car }: { car: Car }) {
  const policyIncomplete = car.minimumAge === null || car.minimumDrivingExperience === null || car.minimumRentalDays === null;
  return (
    <form className="admin-car-editor" action={saveCarAction}>
      <input type="hidden" name="id" value={car.id} />

      <section className="admin-publishing-bar">
        <div><strong>Публикация и доступность</strong><span>Управляет видимостью автомобиля и приёмом новых заявок.</span></div>
        <div className="admin-publishing-switches">
          <label className="admin-switch"><input type="checkbox" name="published" defaultChecked={car.published} /><span /> Опубликован</label>
          <label className="admin-switch"><input type="checkbox" name="available" defaultChecked={car.available} /><span /> Доступен для заявок</label>
        </div>
      </section>

      {policyIncomplete ? <div className="admin-form-warning"><AlertTriangle size={18} /><span><strong>Онлайн-обращения заблокированы</strong>Укажите возраст, стаж и минимальный срок аренды. Не подставляйте приблизительные значения.</span></div> : null}

      <FormSection icon={<CarFront size={19} />} title="Основная информация" description="Название и описание, которые видит клиент в каталоге.">
        <div className="form-grid">
          <TextField name="title" label="Название" value={car.title} required />
          <TextField name="slug" label="Адрес страницы (slug)" value={car.slug} required hint="Латиница, цифры и дефисы" />
          <TextField name="brand" label="Марка" value={car.brand} required />
          <TextField name="model" label="Модель" value={car.model} required />
          <TextField name="bodyType" label="Кузов" value={car.bodyType} required />
          <VehicleClassField value={car.vehicleClass} />
          <TextField name="recommendedOrder" label="Порядок в каталоге" value={car.recommendedOrder} type="number" min={0} max={100000} required />
        </div>
        <TextArea name="shortDescription" label="Краткое описание" value={car.shortDescription} required hint="Один выразительный абзац для карточки каталога" />
        <TextArea name="description" label="Полное описание" value={car.description} required />
      </FormSection>

      <FormSection icon={<BadgeRussianRuble size={19} />} title="Цена и правила аренды" description="Эти значения фиксируются в обращении клиента в момент отправки.">
        <div className="form-grid">
          <TextField name="pricePerDay" label="Цена за сутки, ₽" value={car.pricePerDay} type="number" min={0} max={RENTAL_POLICY.maximumDailyPrice} required />
          <TextField name="oldPrice" label="Старая цена, ₽" value={car.oldPrice} type="number" min={0} max={RENTAL_POLICY.maximumMoneyAmount} />
          <TextField name="deposit" label="Залог, ₽" value={car.deposit} type="number" min={0} max={RENTAL_POLICY.maximumMoneyAmount} required hint="0 — отображать «Индивидуально»" />
          <TextField name="minimumDrivingExperience" label="Минимальный стаж, месяцев" value={car.minimumDrivingExperience} type="number" min={0} max={1200} />
          <TextField name="minimumRentalDays" label="Минимальный срок, суток" value={car.minimumRentalDays} type="number" min={1} max={RENTAL_POLICY.maximumRentalDays} />
          <TextField name="mileageLimit" label="Лимит пробега, км/сутки" value={car.mileageLimit} type="number" min={0} max={100000} />
          <TextField name="extraMileagePrice" label="Перепробег, ₽/км" value={car.extraMileagePrice} type="number" min={0} max={RENTAL_POLICY.maximumMoneyAmount} />
          <TextField name="insurance" label="Страхование" value={car.insurance} />
        </div>
        <TextArea name="rentalConditions" label="Условия аренды" value={car.rentalConditions.join("\n")} hint="Один пункт на строку" />
      </FormSection>

      <FormSection icon={<Settings2 size={19} />} title="Характеристики" description="Технические данные и преимущества автомобиля.">
        <div className="form-grid">
          <TextField name="year" label="Год" value={car.year} type="number" min={1900} max={2200} />
          <TextField name="engine" label="Двигатель" value={car.engine} />
          <TextField name="horsepower" label="Мощность, л.с." value={car.horsepower} type="number" min={1} max={10000} />
          <TextField name="transmission" label="Трансмиссия" value={car.transmission} />
          <TextField name="driveType" label="Привод" value={car.driveType} />
          <TextField name="seats" label="Количество мест" value={car.seats} type="number" min={1} max={100} />
        </div>
        <TextArea name="features" label="Особенности" value={car.features.join("\n")} hint="Один пункт на строку" />
      </FormSection>

      <details className="admin-form-section admin-form-collapsible" open={car.images.length === 0}>
        <summary><span><FileImage size={19} /></span><div><h2>Фотографии и SEO</h2><p>Медиа и данные для поисковой выдачи.</p></div></summary>
        <div className="admin-form-section-body">
          <AdminMediaUploader name="images" ownerType="cars" ownerId={car.id} initialImages={car.images.map((image) => image.url)} mode="multiple" />
          <div className="form-grid"><TextField name="seoTitle" label="SEO title" value={car.seoTitle} /><TextField name="seoDescription" label="SEO description" value={car.seoDescription} /></div>
        </div>
      </details>

      <section className="admin-car-flags">
        <strong>Метки карточки</strong>
        <div>
          <label className="checkbox"><input type="checkbox" name="isNew" defaultChecked={car.isNew} /> Новинка</label>
          <label className="checkbox"><input type="checkbox" name="isPromotion" defaultChecked={car.isPromotion} /> Спецусловие</label>
          <label className="checkbox"><input type="checkbox" name="isDemo" defaultChecked={car.isDemo} /> Данные требуют проверки</label>
        </div>
      </section>

      <footer className="admin-editor-save"><span>Проверьте изменения перед публикацией.</span><button className="admin-primary-action" type="submit"><Save size={17} /> Сохранить автомобиль</button></footer>
    </form>
  );
}
