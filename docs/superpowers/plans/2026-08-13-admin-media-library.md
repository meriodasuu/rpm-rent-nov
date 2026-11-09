# Admin Media Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual image URL fields in car and location admin forms with immediate, direct-to-Supabase file uploads, previews, ordering, downloads, and safe removal.

**Architecture:** A server-only storage module creates short-lived signed upload URLs and removes owned objects. A client `AdminMediaUploader` uploads files directly to Supabase Storage, while admin forms persist stable `/api/media/storage?path=...` references. A read/download proxy resolves private objects without exposing privileged keys.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Supabase Storage REST API, Vitest, existing server actions and Prisma/FileStore abstraction.

## Global Constraints

- New images are selected only from the user's computer; the UI does not accept manually entered URLs.
- JPEG, PNG, and WebP only; maximum 15 MB per file.
- Uploads begin immediately and never use local application storage.
- The bucket is private and all mutation endpoints require a valid admin session.
- Existing local, HTTPS, Yandex proxy, and storage-proxy image references remain readable.
- Cars support multiple ordered images; locations support one image.
- No crop editor, automatic compression, or bulk Yandex migration in this version.

---

### Task 1: Media reference and validation primitives

**Files:**
- Create: `src/lib/admin-media.ts`
- Test: `src/lib/admin-media.test.ts`

**Interfaces:**
- Produces: `ADMIN_MEDIA_MAX_BYTES`, `ADMIN_MEDIA_TYPES`, `validateAdminMediaFile(metadata)`, `buildAdminMediaPath(ownerType, ownerId, mimeType, uuid?)`, `storageMediaUrl(path)`, and `parseStorageMediaUrl(url)`.

- [ ] **Step 1: Write failing tests** for accepted MIME types, the 15 MB boundary, rejected SVG/oversized input, owner ID sanitization, deterministic path generation, and storage URL round-trip.
- [ ] **Step 2: Run** `pnpm vitest run src/lib/admin-media.test.ts` and confirm failures because the module does not exist.
- [ ] **Step 3: Implement** pure validation and URL/path helpers. Paths must match `^(cars|locations)/[A-Za-z0-9_-]{1,100}/[0-9a-f-]+\.(jpg|png|webp)$`; generated references use `/api/media/storage?path=${encodeURIComponent(path)}`.
- [ ] **Step 4: Run** `pnpm vitest run src/lib/admin-media.test.ts` and confirm all tests pass.

### Task 2: Private Supabase Storage boundary and APIs

**Files:**
- Create: `src/lib/supabase-storage.ts`
- Create: `src/app/api/admin/media/sign-upload/route.ts`
- Create: `src/app/api/admin/media/delete/route.ts`
- Create: `src/app/api/media/storage/route.ts`
- Test: `src/lib/supabase-storage.test.ts`
- Test: `src/app/api/admin/media/sign-upload/route.test.ts`

**Interfaces:**
- Consumes: helpers from Task 1 and `getAdminSession()`.
- Produces: `createSignedUpload(path)`, `removeStorageObject(path)`, `downloadStorageObject(path)`, `POST /api/admin/media/sign-upload`, `DELETE /api/admin/media/delete`, and `GET /api/media/storage`.

- [ ] **Step 1: Write failing tests** proving missing configuration fails closed, privileged fetches send `Authorization: Bearer <service-role-key>`, upload signing validates owner/type/size, anonymous mutation requests return 401, and invalid paths return 400.
- [ ] **Step 2: Run** the two targeted test files and verify red failures.
- [ ] **Step 3: Implement** the REST adapter using `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and bucket `SUPABASE_MEDIA_BUCKET` defaulting to `rpm-media`. Never return the service key to the client.
- [ ] **Step 4: Implement** upload signing. Accept JSON `{ ownerType, ownerId, fileName, mimeType, size }`, validate twice on the server, and return `{ path, uploadUrl, token, mediaUrl }`.
- [ ] **Step 5: Implement** authenticated delete for owned storage paths and the read/download proxy with `Content-Disposition: attachment` only when `download=1`.
- [ ] **Step 6: Run** targeted tests and confirm pass.

### Task 3: Reusable uploader interaction

**Files:**
- Create: `src/components/admin/admin-media-uploader.tsx`
- Create: `src/components/admin/admin-media-uploader.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: sign-upload API and stable media URLs from Tasks 1–2.
- Produces: `<AdminMediaUploader name ownerType ownerId initialImages mode />`, where hidden inputs named `name` contain the ordered stable media URLs.

- [ ] **Step 1: Write failing component tests** for file selection, immediate signing/upload request, per-file error, cover selection, move left/right, remove confirmation, download link, and single-image replacement.
- [ ] **Step 2: Run** `pnpm vitest run src/components/admin/admin-media-uploader.test.tsx` and confirm failure.
- [ ] **Step 3: Implement** drag-and-drop plus a visible file picker. Upload directly with `XMLHttpRequest` so each item reports progress; set `x-upsert: false` and the signed token header required by Supabase.
- [ ] **Step 4: Implement** accessible cards with preview, status, «Обложка», «Сделать обложкой», «Влево», «Вправо», «Скачать», and confirmed «Удалить». In `single` mode a successful upload replaces the prior item.
- [ ] **Step 5: Add responsive CSS** for desktop grid and mobile horizontal cards, visible focus, drop-active state, progress bar, errors, and disabled states.
- [ ] **Step 6: Run** component tests and confirm pass.

### Task 4: Integrate cars and locations

**Files:**
- Modify: `src/components/admin/car-form.tsx`
- Modify: `src/app/admin/(panel)/locations/page.tsx`
- Modify: `src/app/admin/actions.ts`
- Modify: `src/lib/validation.ts`
- Test: `src/lib/admin-validation.test.ts`

**Interfaces:**
- Consumes: `AdminMediaUploader` hidden ordered values.
- Produces: persisted car image order and a single persisted location image without manual URL fields.

- [ ] **Step 1: Extend failing validation tests** so storage proxy URLs are accepted and empty location image is allowed only for unpublished drafts.
- [ ] **Step 2: Replace** the car photo textarea with the multiple uploader, keep the section expanded when there are no images, and keep SEO separate from media controls.
- [ ] **Step 3: Replace** the location image text input with the single uploader. Generate a stable location ID before rendering a new form and submit that ID explicitly.
- [ ] **Step 4: Update actions** to parse repeated `images` fields with `formData.getAll`, reject values outside supported legacy/media URL shapes, and preserve submitted order.
- [ ] **Step 5: Run** validation, action, uploader, and existing admin tests.

### Task 5: Supabase and Vercel production configuration

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Consumes: Supabase project `RPM-RENT` and linked Vercel production project.
- Produces: private `rpm-media` bucket, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_MEDIA_BUCKET` production variables.

- [ ] **Step 1: Document** the three variables without committing secret values.
- [ ] **Step 2: Create or verify** private bucket `rpm-media` with 15 MB limit and MIME allowlist `image/jpeg,image/png,image/webp` through the authenticated Supabase project UI/API.
- [ ] **Step 3: Add** the URL as a regular production value and the service-role key as a sensitive production value in Vercel; add bucket name.
- [ ] **Step 4: Redeploy only after local verification succeeds.**

### Task 6: Verification, commit, and deployment

**Files:**
- Modify only files required by fixes discovered during verification.

**Interfaces:**
- Consumes: completed Tasks 1–5.
- Produces: verified production admin media workflow.

- [ ] **Step 1: Run** `pnpm test`, `pnpm typecheck`, targeted ESLint, and `pnpm build`.
- [ ] **Step 2: Start** the local app with production-like Storage variables and test `/admin/cars/<id>`: choose two images, observe progress and previews, reorder, choose cover, save, reopen, and download.
- [ ] **Step 3: Test** `/admin/locations`: replace one image, save, reopen, and verify the public location image.
- [ ] **Step 4: Repeat** the essential upload and reorder/replace paths at desktop and mobile widths; confirm no framework overlay or relevant console errors.
- [ ] **Step 5: Commit** all feature files with `feat: make admin photo uploads intuitive` without staging unrelated pre-existing user changes.
- [ ] **Step 6: Deploy** production through the linked Vercel project and confirm build logs show successful Prisma connectivity and no pending migration failure.
- [ ] **Step 7: Smoke-test** production login, car media persistence, location media persistence, and public rendering; remove QA-only uploaded objects and records.
