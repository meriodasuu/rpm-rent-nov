# RPM Rent Feedback Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перестроить публичные страницы RPM Rent по согласованной обратной связи, добавить системную и ручную темы, актуальные контакты, центральную композицию и визуально проверенный адаптивный интерфейс.

**Architecture:** Сохранить текущий Next.js App Router и `DataStore`. Вынести чистые правила темы, навигации и публичного контента в небольшие тестируемые модули; интерактивность темы и слайдера изолировать в клиентских компонентах. Страницы остаются серверными и получают данные существующим способом.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 6.0.3, Vitest 3.2.4, Lucide React, CSS variables, Next Image.

## Global Constraints

- Прочитать локальные руководства Next.js 16.3.0 в `node_modules/next/dist/docs/` до изменения кода.
- Не менять Prisma-схему, бизнес-логику расчёта, доступности или отправки заявок.
- Первый режим темы берётся из системных настроек; ручной режим `light` или `dark` сохраняется и имеет приоритет.
- Удалить длинные тире из всего публичного пользовательского текста.
- Сохранять серверный рендеринг страниц; клиентскими делать только тему, навигацию и слайдер.
- Проверять desktop и mobile в светлой и тёмной темах.
- Проект не имеет собственного безопасного Git-корня: не выполнять `git add` или `git commit`; после задач проверять только явно перечисленные файлы.

---

## File Map

- Create `src/lib/theme.ts`: типы и чистое разрешение темы.
- Create `src/lib/theme.test.ts`: тесты системного и ручного выбора.
- Create `src/lib/navigation.ts`: чистое определение активного маршрута.
- Create `src/lib/navigation.test.ts`: тесты точного и вложенного маршрута.
- Create `src/lib/site-content.ts`: контакты, социальные ссылки, локации и категории маршрутов.
- Create `src/lib/site-content.test.ts`: проверка нормализованных ссылок и данных.
- Create `src/lib/public-copy.test.ts`: запрет длинных тире в публичных исходниках.
- Create `src/components/theme-toggle.tsx`: трёхрежимный переключатель темы.
- Create `src/components/theme-init-script.tsx`: ранняя установка ручной темы до гидрации.
- Create `src/components/primary-nav.tsx`: навигация с активным состоянием.
- Create `src/components/car-showcase.tsx`: доступная горизонтальная карусель главной.
- Modify `src/app/layout.tsx`: ранний скрипт темы.
- Modify `src/components/header.tsx`: активная навигация и переключатель темы.
- Modify `src/components/footer.tsx`: новый финальный призыв, контакты и копирайт.
- Modify `src/components/car-card.tsx`: нормализовать публичный текст без длинных тире.
- Modify `src/app/page.tsx`: новая структура главной.
- Modify `src/app/services/page.tsx`: удалить hero.
- Modify `src/app/about/page.tsx`: удалить hero и обновить основной CTA.
- Modify `src/app/contacts/page.tsx`: контактная карточка, соцсети и карта.
- Modify `src/app/rental-terms/page.tsx`: компактный поток этапов.
- Modify `src/app/booking/page.tsx`: упрощённая шапка заявки.
- Modify remaining public source files containing `—` or `–`.
- Modify `src/app/globals.css`: темы, центральная геометрия, новые секции и responsive.
- Create `public/images/cars/rpm-footer-cutout.png`: автомобиль без фона для финального блока.

---

### Task 1: Testable theme and active navigation foundations

**Files:**
- Create: `src/lib/theme.ts`
- Create: `src/lib/theme.test.ts`
- Create: `src/lib/navigation.ts`
- Create: `src/lib/navigation.test.ts`

**Interfaces:**
- Produces: `ThemeMode = "system" | "light" | "dark"`.
- Produces: `ResolvedTheme = "light" | "dark"`.
- Produces: `resolveTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme`.
- Produces: `isNavigationActive(pathname: string, href: string): boolean`.

- [ ] **Step 1: Write failing tests for theme resolution**

```ts
import { describe, expect, it } from "vitest";
import { resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("uses the system preference in system mode", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("keeps a manual choice regardless of the system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});
```

- [ ] **Step 2: Run `pnpm test src/lib/theme.test.ts` and confirm missing-module failure**

- [ ] **Step 3: Implement the exact exported types and pure function**

```ts
export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemeMode, "system">;

export const resolveTheme = (mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme =>
  mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;
```

- [ ] **Step 4: Run the theme test and confirm PASS**

- [ ] **Step 5: Write failing navigation tests**

```ts
import { describe, expect, it } from "vitest";
import { isNavigationActive } from "./navigation";

describe("isNavigationActive", () => {
  it("matches exact and nested routes without matching siblings", () => {
    expect(isNavigationActive("/cars", "/cars")).toBe(true);
    expect(isNavigationActive("/cars/porsche", "/cars")).toBe(true);
    expect(isNavigationActive("/contacts", "/cars")).toBe(false);
  });
});
```

- [ ] **Step 6: Run the test, implement `isNavigationActive`, then rerun both test files**

- [ ] **Step 7: Inspect only the four new files and confirm no unrelated changes**

---

### Task 2: Theme UI and active header

**Files:**
- Create: `src/components/theme-toggle.tsx`
- Create: `src/components/theme-init-script.tsx`
- Create: `src/components/primary-nav.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `ThemeMode`, `isNavigationActive`.
- Produces: `ThemeToggle()` with buttons for system, light, and dark.
- Produces: `ThemeInitScript()` that reads `rpm-theme-mode` before hydration.
- Produces: `PrimaryNav({ mobile?: boolean })`.

- [ ] **Step 1: Add component-level source assertions to the existing tests**

Assert that the theme control exposes all three modes and that navigation applies `aria-current="page"` through `isNavigationActive`.

- [ ] **Step 2: Run focused tests and confirm they fail before the components exist**

- [ ] **Step 3: Implement the early theme script**

The inline script must:

```js
const mode = localStorage.getItem("rpm-theme-mode") || "system";
if (mode === "light" || mode === "dark") document.documentElement.dataset.theme = mode;
else document.documentElement.removeAttribute("data-theme");
document.documentElement.dataset.themeMode = mode;
```

- [ ] **Step 4: Implement the client theme control**

Use `Monitor`, `Sun`, and `Moon`; persist mode; update `data-theme` and `data-theme-mode`; subscribe to `prefers-color-scheme` while in system mode; include visible active styling and Russian accessible labels.

- [ ] **Step 5: Implement active desktop/mobile navigation with `usePathname`**

- [ ] **Step 6: Wire the components into layout and header**

- [ ] **Step 7: Add semantic theme tokens and manual/system dark selectors to CSS**

Dark tokens must cover `--bg`, `--surface`, `--surface-2`, `--ink`, `--muted`, `--line`, shadows, form controls, header, cards, and light editorial sections.

- [ ] **Step 8: Run focused tests, typecheck, and inspect the five touched files**

---

### Task 3: Centralized public content and copy quality

**Files:**
- Create: `src/lib/site-content.ts`
- Create: `src/lib/site-content.test.ts`
- Create: `src/lib/public-copy.test.ts`
- Modify: public files reported by the dash scan.

**Interfaces:**
- Produces: `CONTACTS` with phone, address, website and social links.
- Produces: `LOCATIONS` with `title`, `subtitle`, `image`, and `href`.
- Produces: `ROUTE_CATEGORIES` with label, href, and icon key.
- Produces: `normalizeSocialUrl(kind, value): string` for Instagram and Telegram handles plus full URLs.

- [ ] **Step 1: Write failing tests for contact normalization and required contact data**

```ts
expect(normalizeSocialUrl("telegram", "rpmrent")).toBe("https://t.me/rpmrent");
expect(normalizeSocialUrl("instagram", "rpm_rent")).toBe("https://www.instagram.com/rpm_rent");
expect(CONTACTS.phone).toBe("+7 993 983-80-80");
expect(CONTACTS.address).toContain("Маршала Блюхера, 12к7");
```

- [ ] **Step 2: Run and confirm missing-module failure**

- [ ] **Step 3: Implement the content module with all supplied social links and four locations/categories**

- [ ] **Step 4: Run and confirm the content tests pass**

- [ ] **Step 5: Write a failing public-copy scan**

The test reads `.tsx` files under `src/app` excluding `admin` and `src/components`, then fails if a quoted public string contains Unicode `—` or `–`.

- [ ] **Step 6: Run the scan and confirm it reports current public files**

- [ ] **Step 7: Replace long dashes surgically without changing business meaning**

- [ ] **Step 8: Rerun the copy scan and the full test suite**

---

### Task 4: Homepage composition and accessible car showcase

**Files:**
- Create: `src/components/car-showcase.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `Car[]`, `LOCATIONS`, `ROUTE_CATEGORIES`.
- Produces: `CarShowcase({ cars }: { cars: Car[] })`.

- [ ] **Step 1: Add failing source/structure assertions for the homepage**

Assert absence of `quick-search`, `hero-caption`, the removed factual section heading, and presence of `CarShowcase`, `locations-grid`, and the five-step title.

- [ ] **Step 2: Run focused tests and confirm the old page fails the assertions**

- [ ] **Step 3: Implement the client showcase**

Use a labelled region, horizontal scroll-snap, previous/next buttons with disabled handling, image-first cards, model name, up to three characteristic chips, and an empty-state message.

- [ ] **Step 4: Recompose the homepage in the agreed order**

Remove the quick form and secondary hero content; add category chips, city copy, locations, compact services, five steps with a decorative 5, route categories, simplified price section, merged FAQ checklist, and simplified CTA.

- [ ] **Step 5: Add desktop and responsive CSS**

Constrain the central width, maintain full-bleed only for the city background, prevent horizontal page overflow, and keep slider scrolling isolated.

- [ ] **Step 6: Run focused tests, typecheck, and full Vitest**

---

### Task 5: Supporting page reductions and contacts rebuild

**Files:**
- Modify: `src/app/services/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/contacts/page.tsx`
- Modify: `src/app/rental-terms/page.tsx`
- Modify: `src/app/booking/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `CONTACTS` and normalized social links.
- Keeps: existing `BookingForm`, `DataStore`, breadcrumbs, FAQ and service data.

- [ ] **Step 1: Write failing structural assertions for each page**

Check removed hero copy on services/about/contacts, absence of `booking-reassurance`, updated about heading/button, presence of Yandex map URL, and the vertical rental steps class.

- [ ] **Step 2: Run focused tests and confirm failures correspond to old structures**

- [ ] **Step 3: Remove service hero and repair page spacing**

- [ ] **Step 4: Remove about hero and promote the next panel with the approved heading and CTA**

- [ ] **Step 5: Rebuild contacts**

Render phone, address, site, clickable social icons, textual fallback address, and a lazy Yandex map iframe using the encoded supplied address. All external links use `target="_blank"` and `rel="noreferrer"`.

- [ ] **Step 6: Make the rental flow a compact vertical list while preserving step content**

- [ ] **Step 7: Simplify the booking introduction and remove the reassurance strip**

- [ ] **Step 8: Add responsive/dark styles and run focused tests plus typecheck**

---

### Task 6: Transparent footer car and final footer composition

**Files:**
- Create: `public/images/cars/rpm-footer-cutout.png`
- Modify: `src/components/footer.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: generated transparent car PNG and `CONTACTS`.
- Produces: centered `footer-statement` with decorative image marked `alt=""`.

- [ ] **Step 1: Generate/edit the selected RPM car image to remove its background**

Use the Porsche image as the reference; preserve the exact vehicle and yellow paint, remove all background and ground, export a clean transparent PNG without text or shadow clipping.

- [ ] **Step 2: Inspect the generated image at original resolution**

Confirm transparent background, complete silhouette, intact wheels/mirrors and no halo.

- [ ] **Step 3: Add a failing footer structure assertion**

Require the cutout image and centered statement; reject the old two-column statement.

- [ ] **Step 4: Implement the footer composition and updated punctuation**

- [ ] **Step 5: Add responsive and theme-aware CSS, keeping sufficient text contrast**

- [ ] **Step 6: Run focused tests and typecheck**

---

### Task 7: Full verification and visual QA

**Files:**
- Modify only files needed to fix defects found by verification.
- Create QA screenshots under `artifacts/feedback-20260811/qa/`.

**Interfaces:**
- Consumes the completed application.
- Produces fresh evidence for tests, lint, typecheck, build, desktop/mobile and both themes.

- [ ] **Step 1: Run `pnpm test` and require zero failures**

- [ ] **Step 2: Run `pnpm lint` and require zero errors and warnings**

- [ ] **Step 3: Run `pnpm typecheck` and require exit code 0**

- [ ] **Step 4: Run `pnpm build` and require exit code 0**

- [ ] **Step 5: Start the production app locally and capture these routes**

Desktop 1440x1000 and mobile 390x844 for `/`, `/services`, `/about`, `/contacts`, `/rental-terms`, and `/booking`; capture home and contacts in both themes.

- [ ] **Step 6: Inspect every screenshot**

Check clipping, overlap, horizontal overflow, text wrapping, active navigation, slider controls, map, social links, theme switcher, dark surfaces, focus states and footer image contrast.

- [ ] **Step 7: Fix defects and repeat the relevant automated and visual checks**

- [ ] **Step 8: Run a final requirements audit against the design spec and report any intentionally deferred item**
