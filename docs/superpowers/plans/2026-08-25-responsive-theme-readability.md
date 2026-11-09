# Responsive Theme Readability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate text clipping and low-contrast public UI in desktop/mobile light/dark themes, then deploy the verified build to rpmrent.ru.

**Architecture:** Keep responsive layout fixes in the existing global stylesheet. Split the red design token into a foreground-safe accent and a stable filled-control accent so dark-theme text can meet WCAG contrast without weakening white text on red buttons. Verify the palette with Vitest and the rendered pages with browser-based viewport audits.

**Tech Stack:** Next.js 16.3 App Router, React 19, CSS custom properties, Vitest, Docker Compose/Caddy.

**Spec:** User request in this task; no separate design specification.

## Global Constraints

- Preserve all pre-existing working-tree changes.
- Test desktop and 375px-class mobile viewports in light and dark themes.
- No page-level horizontal overflow or clipped visible text.
- Normal-size text contrast target: WCAG AA ratio 4.5:1.
- Deploy through the existing `deploy/deploy.sh` workflow without copying local secrets or development data.

---

### Task 1: Theme contrast tokens

**Files:**
- Modify: `src/app/theme-contrast.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: CSS variables `--bg`, `--surface`, `--accent`, and `--button-primary-ink`.
- Produces: `--accent-fill`, used by red filled controls while `--accent` remains safe for foreground text.

- [ ] **Step 1: Write the failing contrast test**

Add a test that parses the dark-theme custom properties and asserts `--accent` against both `--bg` and `--surface` at `>= 4.5`, plus white text against `--accent-fill` at `>= 4.5`.

- [ ] **Step 2: Run the test to verify RED**

Run: `pnpm test src/app/theme-contrast.test.ts`

Expected: FAIL because the current dark foreground accent is `#cf1515` and does not reach 4.5:1 on dark surfaces.

- [ ] **Step 3: Implement the minimal token split**

Define `--accent-fill: #cf1515` in the root palette, set a lighter `--accent` only in dark palettes, and replace filled red backgrounds/borders (`.button.red`, `.tag.red`, header hover CTA, step icon tiles) with `var(--accent-fill)`.

- [ ] **Step 4: Run the test to verify GREEN**

Run: `pnpm test src/app/theme-contrast.test.ts`

Expected: PASS.

### Task 2: Responsive rendered QA

**Files:**
- Modify only if a reproduced clipping defect remains: `src/app/globals.css`

**Interfaces:**
- Consumes: public routes `/`, `/cars`, `/cars/porsche-911-carrera-4s`, `/booking`, `/services`, `/rental-terms`, `/about`, `/contacts`, `/faq`.
- Produces: page-level overflow count `0`, clipped visible-text count `0`, and readable light/dark screenshots.

- [ ] **Step 1: Reproduce each rendered defect**

Use browser viewport overrides for desktop and 375px-class mobile, switch the visible theme controls, and record element bounds, `scrollWidth`, clipping, console warnings/errors, and screenshots.

- [ ] **Step 2: Apply one minimal responsive correction per reproduced defect**

Adjust only the responsible selector and breakpoint; retain intentional horizontally scrollable carousels.

- [ ] **Step 3: Re-run the same rendered checks**

Expected: no page-level horizontal overflow, no clipped visible text, no framework overlay, and theme controls visibly change the page.

### Task 3: Release and production verification

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: the verified workspace and `/opt/rpm-rent` server deployment.
- Produces: rebuilt `app` and `caddy` services serving rpmrent.ru.

- [ ] **Step 1: Run the full local verification gate**

Run: `pnpm test && pnpm lint && pnpm typecheck && pnpm build`

Expected: every command exits `0`.

- [ ] **Step 2: Transfer the verified workspace without secrets/data**

Sync tracked/source files to `deploy@91.222.239.130:/opt/rpm-rent`, excluding `.env*`, `.data`, `node_modules`, `.next`, output artifacts, and local reports.

- [ ] **Step 3: Run the repository deployment workflow**

Run remotely: `cd /opt/rpm-rent && ./deploy/deploy.sh`

Expected: database backup (when running), image rebuild, Prisma deploy, app/Caddy restart, and healthy Compose service listing.

- [ ] **Step 4: Verify production**

Open `https://rpmrent.ru/`, repeat desktop/mobile light/dark checks, confirm HTTPS, page identity, nonblank DOM, no overlay, healthy console, screenshot evidence, and theme-toggle interaction.
