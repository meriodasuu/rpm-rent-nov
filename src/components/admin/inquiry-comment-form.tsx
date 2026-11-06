"use client";

import { useActionState, useState } from "react";
import { updateInquiryCommentAction } from "@/app/admin/inquiry-comment-actions";

export function InquiryCommentForm({ kind, id, comment }: { kind: "booking" | "lead"; id: string; comment?: string | null }) {
  const [value, setValue] = useState(comment ?? "");
  const [edited, setEdited] = useState(false);
  const [state, action, pending] = useActionState(updateInquiryCommentAction, { error: "", saved: false });
  const fieldId = `manager-comment-${kind}-${id}`;
  return <section className="admin-booking-note admin-inquiry-comment">
    <h3><label htmlFor={fieldId}>Комментарий менеджера</label></h3>
    <form action={action} onSubmit={() => setEdited(false)}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <textarea id={fieldId} name="comment" rows={4} maxLength={1000} value={value} disabled={pending}
        onChange={(event) => { setValue(event.target.value); setEdited(true); }}
        placeholder="Договорённости с клиентом, пожелания, результат звонка…" />
      <div className="admin-inquiry-comment-actions">
        <button className="admin-primary-action" type="submit" disabled={pending}>{pending ? "Сохраняем…" : "Сохранить комментарий"}</button>
        <small>{value.length} / 1000</small>
      </div>
      {!edited && state.error ? <p role="alert">{state.error}</p> : null}
      {!edited && state.saved ? <p role="status">Комментарий сохранён</p> : null}
    </form>
  </section>;
}
