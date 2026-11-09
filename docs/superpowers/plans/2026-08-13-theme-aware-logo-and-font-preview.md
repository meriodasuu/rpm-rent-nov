# Theme-aware logo and font preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the supplied RPM logo, theme-aware public header/footer chrome, and a removable three-option font preview selector beside the theme control.

**Architecture:** Brand assets are stored locally under `public/images/brand` and rendered by the shared `Logo` component. Theme and font choice are each managed by narrowly scoped client controls that update document data attributes and local storage; global CSS maps those attributes to public-chrome and font tokens.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next/image`, CSS custom properties, Vitest, Lucide.

## Global Constraints

- Light public chrome is white and renders `RPMrent_Логотип_Черный на белом фоне.png`.
- Dark public chrome is black and renders `RPMrent_Логотип_Белый на черном фоне.png`.
- The admin header remains dark and always uses the white-on-black logo.
- Font choices are exactly `Наш шрифт`, `Conthrax`, and `Inter`.
- The font selector is temporary, client-only, beside `ThemeToggle`, and removable as one focused component plus its CSS.
- The selector persists locally but defaults safely to `Наш шрифт`.
- Do not alter pricing, booking eligibility, or non-chrome page content.

---

### Task 1: Install supplied logo and font assets locally

**Files:**
- Create: `public/images/brand/rpm-logo-dark.png`
- Create: `public/images/brand/rpm-logo-light.png`
- Create: `public/fonts/conthrax-sb.ttf`
- Create: `public/fonts/inter-variable.ttf`
- Test: `src/components/logo.test.tsx`

**Interfaces:**
- Consumes: supplied Yandex Disk assets identified in the design spec.
- Produces: local stable asset paths consumed by `Logo` and global `@font-face` rules.

- [ ] **Step 1: Write the failing logo asset rendering test**

```tsx
it("includes both theme-specific RPM logo sources", () => {
  const html = renderToStaticMarkup(<Logo />);
  expect(html).toContain("/images/brand/rpm-logo-light.png");
  expect(html).toContain("/images/brand/rpm-logo-dark.png");
  expect(html).not.toContain("<span>RPM</span>");
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm vitest run src/components/logo.test.tsx`

Expected: FAIL because `Logo` still renders the text-only mark.

- [ ] **Step 3: Export compact brand assets and unpack fonts**

Download the two supplied PNG files, crop the square canvas to the non-background artwork with a small safe margin, and save theme-named PNGs. Extract `conthrax-sb.ttf` and `Inter-VariableFont_opsz,wght.ttf` to the listed local paths.

- [ ] **Step 4: Implement both logo image variants**

Render two `next/image` children in `Logo`, each with a semantic class, matching alt text, and CSS-controlled light/dark visibility. Keep the surrounding home link and aria label unchanged.

- [ ] **Step 5: Run the focused test to verify it passes**

Run: `pnpm vitest run src/components/logo.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the asset and logo work**

```bash
git add public/images/brand public/fonts src/components/logo.tsx src/components/logo.test.tsx src/app/globals.css
git commit -m "feat: add theme-aware RPM logo assets"
```

### Task 2: Create the temporary font preview control

**Files:**
- Create: `src/components/font-preview-toggle.tsx`
- Create: `src/components/font-preview-toggle.test.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: local `@font-face` names `ConthraxPreview` and `InterPreview`; `--font-manrope` from `layout.tsx`.
- Produces: root `data-font` values `manrope`, `conthrax`, or `inter`; local storage key `rpm-font-preview`.

- [ ] **Step 1: Write failing state behavior tests**

```tsx
it("uses Manrope when no saved preference exists", () => {
  expect(readFontPreference()).toBe("manrope");
});

it("applies and persists an explicit font selection", () => {
  applyFontPreference("inter");
  expect(document.documentElement.dataset.font).toBe("inter");
  expect(localStorage.getItem("rpm-font-preview")).toBe("inter");
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `pnpm vitest run src/components/font-preview-toggle.test.tsx`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the isolated selector**

Create a client component that reads/writes `rpm-font-preview`, applies the root data attribute, uses three labelled buttons with `aria-pressed`, and exports the small preference helpers needed by the test. On mobile, retain an accessible compact trigger plus an open choice list.

- [ ] **Step 4: Mount it beside the existing theme control**

In `Header`, render `<FontPreviewToggle />` directly before or after `<ThemeToggle />` inside `.header-actions`. Add an inline startup script or hydration-safe initial value in `layout.tsx` so saved choice is applied without a visible font flash.

- [ ] **Step 5: Map fonts through one global CSS token**

Declare local `@font-face` definitions and set `--site-font` for `data-font="manrope"`, `conthrax`, and `inter`. Replace the global body font declaration with `font-family: var(--site-font)`.

- [ ] **Step 6: Run focused tests to verify they pass**

Run: `pnpm vitest run src/components/font-preview-toggle.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the font preview work**

```bash
git add src/components/font-preview-toggle.tsx src/components/font-preview-toggle.test.tsx src/components/header.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add temporary font preview selector"
```

### Task 3: Make public header and footer follow the selected theme

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/components/footer.test.tsx`
- Test: `src/components/logo.test.tsx`

**Interfaces:**
- Consumes: `data-theme="light"|"dark"` set by `ThemeToggle`; logo classes from Task 1.
- Produces: explicit public chrome CSS tokens that control header/footer background, foreground, borders, CTA, menu, and logo visibility.

- [ ] **Step 1: Extend failing coverage for the public chrome contract**

```tsx
it("keeps a text-only footer statement while using the shared image logo", () => {
  const html = renderToStaticMarkup(<Footer />);
  expect(html).toContain("rpm-logo-light.png");
  expect(html).toContain("rpm-logo-dark.png");
  expect(html).not.toContain("rpm-footer-cutout");
});
```

- [ ] **Step 2: Run focused component tests to verify expected failure**

Run: `pnpm vitest run src/components/logo.test.tsx src/components/footer.test.tsx`

Expected: FAIL until the shared logo is image-backed.

- [ ] **Step 3: Add light and dark public-chrome tokens**

Define `--chrome-bg`, `--chrome-ink`, `--chrome-muted`, `--chrome-line`, and CTA colors for the root and dark theme. Update the later overriding header/footer rules to consume those tokens instead of unconditional black/white values. Include mobile panel and theme/font controls.

- [ ] **Step 4: Keep the footer statement legible in both themes**

Apply a dark statement field only in dark theme; in light theme use a white field with dark statement copy and a subtle divider so the footer is visibly light without reintroducing imagery.

- [ ] **Step 5: Run focused component tests to verify they pass**

Run: `pnpm vitest run src/components/logo.test.tsx src/components/footer.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit theme-aware public chrome**

```bash
git add src/app/globals.css src/components/footer.test.tsx src/components/logo.test.tsx
git commit -m "feat: align public chrome with active theme"
```

### Task 4: Visual and production verification

**Files:**
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: tasks 1–3.
- Produces: browser-backed evidence for public chrome, logo blending, and all font choices.

- [ ] **Step 1: Start the local application**

Run: `pnpm dev --hostname 127.0.0.1 --port 3100`

Expected: application is available for local browser QA.

- [ ] **Step 2: Verify desktop light and dark theme states**

At 1440 × 1000: check the header/footer background, matching logo asset, dark/light navigation, CTA, and no visible square around either logo.

- [ ] **Step 3: Verify all font choices and persistence**

Select `Наш шрифт`, `Conthrax`, and `Inter`; confirm document root values, visible type change, and restored selection after reload.

- [ ] **Step 4: Verify mobile behavior**

At 390 × 844: check the compact font control, theme control, mobile menu, footer, and that document width does not exceed viewport width.

- [ ] **Step 5: Record QA and run full checks**

Append the exact checked states and findings to `design-qa.md`, then run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm prisma:validate
pnpm exec next build --webpack
git diff --check
```

Expected: every command exits 0 and the QA document ends with `final result: passed`.

- [ ] **Step 6: Commit final verification record**

```bash
git add design-qa.md
git commit -m "docs: verify theme-aware brand preview"
```
