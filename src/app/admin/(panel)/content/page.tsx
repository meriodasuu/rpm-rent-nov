import { CheckCircle2, CircleHelp, Plus, Sparkles } from "lucide-react";
import { deleteFaqAction, deleteServiceAction, saveFaqAction, saveServiceAction } from "@/app/admin/actions";
import { getStore } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Контент" };

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [query, store] = await Promise.all([searchParams, getStore()]);
  const [services, faqs] = await Promise.all([store.getServices({ includeHidden: true }), store.getFaqs({ includeHidden: true })]);
  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-page-heading">
          <div><p className="admin-kicker">Редактирование без кода</p><h1>Контент</h1><p>Дополнительные услуги и ответы на частые вопросы.</p></div>
          {query.saved ? <span className="admin-save-notice"><CheckCircle2 size={16} /> Изменения сохранены</span> : null}
        </header>

        <div className="admin-content-columns">
          <section className="admin-content-section">
            <header><span><Sparkles size={19} /></span><div><h2>Услуги</h2><p>{services.length} позиций</p></div></header>
            <div className="admin-content-items">
              {services.map((service) => (
                <details key={service.id} className="admin-content-editor">
                  <summary><span><strong>{service.title}</strong><small>{service.price === null ? "Цена по запросу" : formatPrice(service.price)} · {service.published ? "На сайте" : "Скрыта"}</small></span><span>Изменить</span></summary>
                  <form action={saveServiceAction}>
                    <input type="hidden" name="id" value={service.id} />
                    <div className="form-grid"><div className="field"><label>Название</label><input className="input" name="title" defaultValue={service.title} /></div><div className="field"><label>Slug</label><input className="input" name="slug" defaultValue={service.slug} /></div></div>
                    <div className="field"><label>Описание</label><textarea className="textarea" name="description" defaultValue={service.description} /></div>
                    <div className="form-grid"><div className="field"><label>Цена</label><input className="input" name="price" type="number" defaultValue={service.price ?? ""} /></div><div className="field"><label>Порядок</label><input className="input" name="sortOrder" type="number" defaultValue={service.sortOrder} /></div></div>
                    <label className="checkbox"><input type="checkbox" name="published" defaultChecked={service.published} /> Опубликована</label>
                    <div className="admin-editor-actions"><button className="button" type="submit">Сохранить</button><button className="button ghost" formAction={deleteServiceAction} type="submit">Удалить</button></div>
                  </form>
                </details>
              ))}
              <details className="admin-content-editor is-new">
                <summary><span><strong><Plus size={15} /> Новая услуга</strong><small>Добавить позицию в каталог</small></span><span>Создать</span></summary>
                <form action={saveServiceAction}><input type="hidden" name="published" value="on" /><div className="field"><label>Название</label><input className="input" name="title" required /></div><div className="field"><label>Slug</label><input className="input" name="slug" required /></div><div className="field"><label>Описание</label><textarea className="textarea" name="description" required /></div><button className="button red" type="submit">Добавить услугу</button></form>
              </details>
            </div>
          </section>

          <section className="admin-content-section">
            <header><span><CircleHelp size={19} /></span><div><h2>FAQ</h2><p>{faqs.length} вопросов</p></div></header>
            <div className="admin-content-items">
              {faqs.map((faq) => (
                <details key={faq.id} className="admin-content-editor">
                  <summary><span><strong>{faq.question}</strong><small>{faq.category} · {faq.published ? "На сайте" : "Скрыт"}</small></span><span>Изменить</span></summary>
                  <form action={saveFaqAction}>
                    <input type="hidden" name="id" value={faq.id} />
                    <div className="field"><label>Вопрос</label><input className="input" name="question" defaultValue={faq.question} /></div>
                    <div className="field"><label>Ответ</label><textarea className="textarea" name="answer" defaultValue={faq.answer} /></div>
                    <div className="form-grid"><div className="field"><label>Категория</label><input className="input" name="category" defaultValue={faq.category} /></div><div className="field"><label>Порядок</label><input className="input" name="sortOrder" type="number" defaultValue={faq.sortOrder} /></div></div>
                    <label className="checkbox"><input type="checkbox" name="published" defaultChecked={faq.published} /> Опубликован</label>
                    <div className="admin-editor-actions"><button className="button" type="submit">Сохранить</button><button className="button ghost" formAction={deleteFaqAction} type="submit">Удалить</button></div>
                  </form>
                </details>
              ))}
              <details className="admin-content-editor is-new">
                <summary><span><strong><Plus size={15} /> Новый вопрос</strong><small>Добавить ответ в FAQ</small></span><span>Создать</span></summary>
                <form action={saveFaqAction}><input type="hidden" name="published" value="on" /><div className="field"><label>Вопрос</label><input className="input" name="question" required /></div><div className="field"><label>Ответ</label><textarea className="textarea" name="answer" required /></div><button className="button red" type="submit">Добавить вопрос</button></form>
              </details>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
