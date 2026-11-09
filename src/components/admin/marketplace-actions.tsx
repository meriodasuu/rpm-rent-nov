"use client";

import { useActionState } from "react";
import {
  confirmAvitoLinkAction,
  initialLinkPreviewState,
  initialMarketplaceActionState,
  previewAvitoLinkAction,
  refreshMarketplaceAction,
  unlinkAvitoListingAction,
} from "@/app/admin/marketplaces/actions";
import styles from "@/app/admin/(panel)/marketplaces/marketplace-actions.module.css";

const Feedback = ({ state }: { state: { status: string; message?: string } }) => state.message
  ? <p className={`${styles.feedback} ${state.status === "ERROR" ? styles.feedbackError : styles.feedbackSuccess}`} role={state.status === "ERROR" ? "alert" : "status"}>{state.message}</p>
  : null;

export function MarketplaceRefreshForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(refreshMarketplaceAction, initialMarketplaceActionState);
  return <form action={action} className={styles.actionForm}>
    <button className="admin-primary-action" type="submit" disabled={disabled || pending}>{pending ? "Проверяем…" : "Проверить сейчас"}</button>
    <Feedback state={state} />
  </form>;
}

export function MarketplaceLinkForm({ carId }: { carId: string }) {
  const [previewState, previewAction, previewPending] = useActionState(previewAvitoLinkAction, initialLinkPreviewState);
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmAvitoLinkAction, initialMarketplaceActionState);
  return <div className={styles.workflow}>
    <form action={previewAction} className={styles.inlineForm}>
      <input type="hidden" name="carId" value={carId} />
      <label>
        <span>Ссылка или ID объявления</span>
        <input name="reference" required maxLength={500} placeholder="https://www.avito.ru/… или 123456789" />
      </label>
      <button type="submit" disabled={previewPending}>{previewPending ? "Ищем…" : "Найти"}</button>
    </form>
    <Feedback state={previewState} />
    {previewState.preview ? <form action={confirmAction} className={styles.previewCard}>
      <input type="hidden" name="carId" value={previewState.preview.carId} />
      <input type="hidden" name="externalId" value={previewState.preview.externalId} />
      <div><small>Avito #{previewState.preview.externalId}</small><strong>{previewState.preview.title}</strong></div>
      <div><small>Цена</small><strong>{previewState.preview.price === null ? "Недоступна" : `${previewState.preview.price.toLocaleString("ru-RU")} ₽`}</strong></div>
      <div><small>Статус</small><strong>{previewState.preview.platformStatus}</strong></div>
      <button type="submit" disabled={confirmPending}>{confirmPending ? "Привязываем…" : "Подтвердить привязку"}</button>
    </form> : null}
    <Feedback state={confirmState} />
  </div>;
}

export function MarketplaceUnlinkForm({ carId, listingId }: { carId: string; listingId: string }) {
  const [state, action, pending] = useActionState(unlinkAvitoListingAction, initialMarketplaceActionState);
  return <form action={action} className={styles.unlinkForm}>
    <input type="hidden" name="carId" value={carId} />
    <input type="hidden" name="listingId" value={listingId} />
    <button type="submit" disabled={pending}>{pending ? "Удаляем связь…" : "Отвязать объявление"}</button>
    <Feedback state={state} />
  </form>;
}
