"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Download, GripVertical, ImagePlus, LoaderCircle, Star, Trash2, UploadCloud } from "lucide-react";
import { ADMIN_MEDIA_TYPES, parseStorageMediaUrl, validateAdminMediaFile, type AdminMediaOwnerType } from "@/lib/admin-media";

type MediaItem = {
  id: string;
  url: string;
  name: string;
  progress: number;
  status: "ready" | "uploading" | "error";
  error?: string;
  uploadedThisSession?: boolean;
};

export const moveMediaItem = <T,>(items: T[], from: number, to: number) => {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
};

const initialItem = (url: string, index: number): MediaItem => ({ id: `existing-${index}-${url}`, url, name: `Фото ${index + 1}`, progress: 100, status: "ready" });

const uploadFile = async (
  file: File,
  ownerType: AdminMediaOwnerType,
  ownerId: string,
  onProgress: (progress: number) => void,
) => {
  const signedResponse = await fetch("/api/admin/media/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerType, ownerId, fileName: file.name, mimeType: file.type, size: file.size }),
  });
  const signed = await signedResponse.json() as { uploadMode?: "local" | "supabase"; uploadUrl?: string; mediaUrl?: string; message?: string };
  if (!signedResponse.ok || !signed.uploadUrl || !signed.mediaUrl) throw new Error(signed.message || "Не удалось подготовить загрузку");

  if (signed.uploadMode === "local") {
    const response = await fetch(signed.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(payload?.message || "Не удалось сохранить фотографию");
    }
    onProgress(100);
    return signed.mediaUrl;
  }

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signed.uploadUrl!);
    request.setRequestHeader("x-upsert", "false");
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    request.onerror = () => reject(new Error("Соединение прервано. Попробуйте ещё раз"));
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("Supabase не принял файл"));
    const form = new FormData();
    form.append("cacheControl", "3600");
    form.append("", file);
    request.send(form);
  });
  return signed.mediaUrl;
};

export function AdminMediaUploader({
  name,
  ownerType,
  ownerId,
  initialImages,
  mode,
}: {
  name: "images" | "image";
  ownerType: AdminMediaOwnerType;
  ownerId: string;
  initialImages: string[];
  mode: "multiple" | "single";
}) {
  const [items, setItems] = useState<MediaItem[]>(() => initialImages.map(initialItem));
  const [removed, setRemoved] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const singleUploadSequence = useRef(0);
  const hasUploadsInProgress = items.some((item) => item.status === "uploading");

  useEffect(() => {
    const form = inputRef.current?.closest("form");
    if (!form || !hasUploadsInProgress) return;
    const preventEarlySave = (event: SubmitEvent) => {
      event.preventDefault();
      window.alert("Дождитесь окончания загрузки фотографий");
    };
    form.addEventListener("submit", preventEarlySave);
    return () => form.removeEventListener("submit", preventEarlySave);
  }, [hasUploadsInProgress]);

  const patchItem = (id: string, patch: Partial<MediaItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));

  const addFiles = (files: FileList | File[]) => {
    const selected = mode === "single" ? Array.from(files).slice(0, 1) : Array.from(files);
    const previousSingleItems = mode === "single" ? items : [];
    const uploadSequence = mode === "single" ? ++singleUploadSequence.current : 0;
    for (const file of selected) {
      const validation = validateAdminMediaFile({ mimeType: file.type, size: file.size });
      const id = crypto.randomUUID();
      const placeholder: MediaItem = { id, url: URL.createObjectURL(file), name: file.name, progress: 0, status: validation.ok ? "uploading" : "error", error: validation.ok ? undefined : validation.error, uploadedThisSession: true };
      setItems((current) => mode === "single" ? [...previousSingleItems, placeholder] : [...current, placeholder]);
      if (!validation.ok) continue;
      void uploadFile(file, ownerType, ownerId, (progress) => patchItem(id, { progress }))
        .then(async (url) => {
          if (mode === "single" && uploadSequence !== singleUploadSequence.current) {
            await fetch("/api/admin/media/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaUrl: url }) });
            return;
          }
          if (mode === "single") {
            const removedUrls: string[] = [];
            await Promise.all(previousSingleItems.map(async (item) => {
              if (!parseStorageMediaUrl(item.url)) return;
              if (item.uploadedThisSession) {
                await fetch("/api/admin/media/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaUrl: item.url }) });
              } else {
                removedUrls.push(item.url);
              }
            }));
            if (removedUrls.length) setRemoved((current) => [...new Set([...current, ...removedUrls])]);
            setItems([{ ...placeholder, url, progress: 100, status: "ready" }]);
          } else {
            patchItem(id, { url, progress: 100, status: "ready" });
          }
          URL.revokeObjectURL(placeholder.url);
        })
        .catch((error: unknown) => patchItem(id, { status: "error", error: error instanceof Error ? error.message : "Не удалось загрузить файл" }));
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeItem = async (item: MediaItem) => {
    if (!window.confirm(`Удалить «${item.name}»?`)) return;
    setItems((current) => current.filter((candidate) => candidate.id !== item.id));
    if (item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
    if (parseStorageMediaUrl(item.url)) {
      if (item.uploadedThisSession) {
        await fetch("/api/admin/media/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mediaUrl: item.url }) });
      } else {
        setRemoved((current) => [...current, item.url]);
      }
    }
  };

  const move = (from: number, to: number) => setItems((current) => moveMediaItem(current, from, to));
  const readyItems = items.filter((item) => item.status === "ready");

  return <div className={`admin-media-uploader ${dragging ? "is-dragging" : ""}`}>
    {readyItems.map((item) => <input key={`value-${item.id}`} type="hidden" name={name} value={item.url} />)}
    {removed.map((url) => <input key={`removed-${url}`} type="hidden" name="removedMedia" value={url} />)}

    <div
      className="admin-media-dropzone"
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
    >
      <UploadCloud size={28} />
      <div><strong>{mode === "multiple" ? "Перетащите фотографии сюда" : "Перетащите изображение сюда"}</strong><span>JPEG, PNG или WebP · до 15 МБ</span></div>
      <button className="button" type="button" onClick={() => inputRef.current?.click()}><ImagePlus size={16} /> {items.length ? "Добавить ещё" : "Выбрать файл"}</button>
      <input ref={inputRef} className="admin-media-file-input" type="file" accept={ADMIN_MEDIA_TYPES.join(",")} multiple={mode === "multiple"} onChange={(event) => event.target.files && addFiles(event.target.files)} />
    </div>

    {items.length ? <div className={`admin-media-grid ${mode === "single" ? "is-single" : ""}`}>
      {items.map((item, index) => <article
        className={`admin-media-card is-${item.status}`}
        key={item.id}
        draggable={mode === "multiple" && item.status === "ready"}
        onDragStart={() => setDragIndex(index)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => { if (dragIndex !== null) move(dragIndex, index); setDragIndex(null); }}
      >
        <div className="admin-media-preview">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin previews include blob URLs before upload */}
          <img src={item.url} alt="" />
          {item.status === "uploading" ? <span className="admin-media-progress-label"><LoaderCircle className="spin" size={16} /> {item.progress}%</span> : null}
          {item.status === "ready" && index === 0 && mode === "multiple" ? <span className="admin-media-cover"><Star size={13} /> Обложка</span> : null}
          {mode === "multiple" && item.status === "ready" ? <span className="admin-media-grip" aria-hidden="true"><GripVertical size={17} /></span> : null}
        </div>
        {item.status === "uploading" ? <div className="admin-media-progress"><span style={{ width: `${item.progress}%` }} /></div> : null}
        <div className="admin-media-meta"><strong title={item.name}>{item.name}</strong>{item.status === "ready" ? <span><Check size={13} /> Загружено</span> : null}{item.error ? <span className="error">{item.error}</span> : null}</div>
        <div className="admin-media-actions">
          {mode === "multiple" && item.status === "ready" ? <>
            {index > 0 ? <button type="button" title="Сделать обложкой" aria-label="Сделать обложкой" onClick={() => move(index, 0)}><Star size={16} /></button> : null}
            <button type="button" title="Переместить влево" aria-label="Переместить влево" disabled={index === 0} onClick={() => move(index, index - 1)}><ChevronLeft size={16} /></button>
            <button type="button" title="Переместить вправо" aria-label="Переместить вправо" disabled={index === items.length - 1} onClick={() => move(index, index + 1)}><ChevronRight size={16} /></button>
          </> : null}
          {item.status === "ready" ? <a href={`${item.url}${item.url.includes("?") ? "&" : "?"}download=1`} download title="Скачать" aria-label="Скачать"><Download size={16} /></a> : null}
          <button type="button" title="Удалить" aria-label="Удалить" onClick={() => void removeItem(item)}><Trash2 size={16} /></button>
        </div>
      </article>)}
    </div> : <p className="admin-media-empty">Пока нет загруженных фотографий.</p>}
  </div>;
}
