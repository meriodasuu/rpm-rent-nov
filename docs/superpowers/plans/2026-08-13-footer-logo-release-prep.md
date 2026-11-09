# Footer And Logo Release Prep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original text logo and replace the footer vehicle composition with centered copy only.

**Architecture:** Reuse the existing `Logo` and `Footer` component boundaries. Add a focused structural regression test for the server-rendered markup, then make minimal TSX and CSS changes; keep pricing and booking-policy behavior outside this task.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, React server rendering, CSS.

## Global Constraints

- The footer must not render a vehicle image.
- The footer statement must contain only “Ваш маршрут начинается здесь.” centered in two lines.
- The original text logo `RPM` / `RENT` must render in the header and footer.
- Existing footer navigation, contacts, MAX, and legal links must remain.
- Pricing and booking eligibility must not change before confirmed data arrives.

---

### Task 1: Lock footer and logo markup with a regression test

**Files:**
- Create: `src/components/footer.test.tsx`
- Test: `src/components/footer.test.tsx`

**Interfaces:**
- Consumes: `Footer(): JSX.Element` and `Logo(): JSX.Element`.
- Produces: assertions for original logo copy, centered statement copy, and absence of `rpm-footer-cutout.png`.

- [ ] **Step 1: Write the failing test**

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";

describe("Footer", () => {
  it("uses the original text logo and a text-only statement", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain(">RPM<");
    expect(html).toContain(">RENT<");
    expect(html).toContain("Ваш маршрут");
    expect(html).toContain("начинается здесь.");
    expect(html).not.toContain("rpm-footer-cutout.png");
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run: `node_modules/.bin/vitest.cmd run src/components/footer.test.tsx`
Expected: FAIL because the current logo is an image and the footer contains `rpm-footer-cutout.png`.

- [ ] **Step 3: Commit the failing regression test only after implementation turns it green**

The test and implementation are committed together after Task 2.

### Task 2: Restore original logo and simplify footer markup

**Files:**
- Modify: `src/components/logo.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/footer.test.tsx`

**Interfaces:**
- Consumes: existing `.logo`, `.footer-statement`, `.site-footer` selectors.
- Produces: the same `Logo` and `Footer` component exports with corrected markup.

- [ ] **Step 1: Restore the original logo markup**

```tsx
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="RPM Rent, на главную">
      <span>RPM</span>
      <small>RENT</small>
    </Link>
  );
}
```

- [ ] **Step 2: Remove the footer image**

Delete the `Image` import and the `<Image ... src="/images/cars/rpm-footer-cutout.png" />` element. Keep the statement `<strong>` and lower footer grid.

- [ ] **Step 3: Replace the final footer/logo overrides**

Restore text-logo sizing and set `.site-footer .footer-statement` to a centered text-only block with `min-height: clamp(300px, 38vw, 500px)`. Remove active `.footer-statement > img` styling and image-sized mobile overrides.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run: `node_modules/.bin/vitest.cmd run src/components/footer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit the implementation**

```powershell
git add src/components/footer.test.tsx src/components/footer.tsx src/components/logo.tsx src/app/globals.css
git commit -m "fix: restore logo and simplify footer"
```

### Task 3: Visual QA and release checks

**Files:**
- Modify: `design-qa.md`
- Create: `qa-footer-desktop.png`
- Create: `qa-footer-mobile.png`

**Interfaces:**
- Consumes: local Next.js app on port 3000 and the source screenshot.
- Produces: browser evidence and a `design-qa.md` result of `passed` only when no P0/P1/P2 issue remains.

- [ ] **Step 1: Run the local app and capture desktop footer at 1440 × 1000**

Verify that the statement has no image, copy is centered, and the original logo renders.

- [ ] **Step 2: Capture mobile footer at 390 × 844**

Verify no horizontal overflow and readable centered wrapping.

- [ ] **Step 3: Compare reference and captures in the same visual review input**

Fix P0/P1/P2 differences and recapture at the same viewport.

- [ ] **Step 4: Update `design-qa.md`**

Record source, implementation captures, viewport, focused comparison, history, console state, and exact `final result`.

- [ ] **Step 5: Run complete verification**

Run TypeScript, ESLint, all Vitest tests, Prisma validation, `git diff --check`, and `next build --webpack`. All commands must exit 0.

- [ ] **Step 6: Commit and push `main`**

Commit the QA report with the implementation if it changed after the implementation commit, then push `main` to `origin`.
