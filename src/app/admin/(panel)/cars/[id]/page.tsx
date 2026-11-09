import Link from "next/link";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { CarForm } from "@/components/admin/car-form";
import { deleteCarAction } from "@/app/admin/actions";
import { getStore } from "@/lib/data";

export default async function EditCarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const car = await (await getStore()).getCarById(id);
  if (!car) notFound();
  return (
    <div className="admin-page">
      <div className="admin-container">
        <Link className="admin-back-link" href="/admin/cars"><ArrowLeft size={15} /> Автопарк</Link>
        <header className="admin-page-heading"><div><p className="admin-kicker">Карточка автомобиля</p><h1>{car.title}</h1><p>Изменения попадут в каталог после сохранения.</p></div>{query.saved ? <span className="admin-save-notice"><CheckCircle2 size={16} /> Сохранено</span> : null}</header>
        <CarForm car={car} />
        <details className="admin-danger-zone">
          <summary><span><Trash2 size={17} /> Удаление автомобиля</span><small>Необратимое действие</small></summary>
          <div><p>Для временного снятия с сайта отключите публикацию в форме выше. Удаление полностью сотрёт карточку.</p><form action={deleteCarAction}><input type="hidden" name="id" value={car.id} /><input className="input" name="confirmation" placeholder="Введите УДАЛИТЬ" /><button className="button red" type="submit">Удалить навсегда</button></form></div>
        </details>
      </div>
    </div>
  );
}
