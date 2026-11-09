# Design QA — правки по скриншотам

## Артефакты

- Source visual truth: `C:\Users\wthtw\Downloads\Сайт RPM-20260811T083144Z-1-001\новые правки\` (15 PNG-скриншотов с подписями).
- Rendered implementation: `http://localhost:3000/`.
- Desktop evidence: `qa-home-desktop-top.png`, `qa-home-showcase.png`, `qa-home-steps-focus.png`, `qa-home-price.png`, `qa-contacts-desktop.png`, `qa-about-desktop.png`, `qa-rental-terms-flow-fixed.png`.
- Mobile evidence: `qa-home-mobile-top.png`, `qa-home-mobile-steps.png`, `qa-contacts-mobile.png`, `qa-contacts-mobile-dark.png`.
- Desktop viewport: 1440 × 1000 CSS px, device scale factor 1.
- Mobile viewport: 390 × 844 CSS px, device scale factor 1.
- Source screenshots: 548 × 809 px and 548 × 282–580 px depending on the annotated screen. Source is a messenger capture rather than a 1:1 browser viewport, so comparison was normalized by matching the visible component/section rather than browser chrome.
- State: public pages, light theme; contacts additionally checked in dark theme.

## Full-view comparison evidence

- The new hero is visibly shorter than the rejected version, contains a real night-road photograph, no car, and preserves the requested headline.
- The vehicle showcase is now one large card plus two stacked cards and contains exactly three cars, matching the approved composition.
- The five-step section is now five equal visual cards with number, icon, exact caption text, and a real photograph in every card.
- The price section retains the black field but replaces the previous CSS decoration with functional row icons and a balanced white calculation card.
- Contacts visibly show Phone, MAX with `+7 993 983-80-80`, address, and channel tiles. The unwanted “Перейти к оформлению” control is absent.

## Focused region comparison evidence

- Typography: explicit line breaks were verified for “Подберем / премиальное / авто / в аренду” and “Автомобили / для разных / маршрутов”. “От каталога до подтверждения” was recaptured after fixing overflow.
- Spacing/layout: hero, three-car grid, five-step cards, calculation card, contact rows, desktop and mobile horizontal bounds were inspected. Mobile document width stays within the viewport.
- Colors/tokens: red action color, neutral light surfaces, black contrast sections, and dark-theme contact surfaces remain consistent and readable.
- Image quality/assets: hero uses a dedicated generated road photograph; step cards use supplied Google Drive car photography; no CSS-art image substitutes remain in these sections.
- Copy/content: all screenshot captions were checked; public occurrences of “заявка/запрос” were removed; MAX appears as a primary contact and first channel tile.

## Comparison history

1. Earlier implementation — P1: steps used an editorial list instead of five image cards; vehicle area used the wrong multi-card layout; MAX was too easy to miss; price decoration was an arbitrary CSS circle. Fixed by rebuilding all four sections and adding a dedicated MAX contact row/tile.
2. First browser pass — P1: RPM logo source had a large canvas and rendered outside its intended header crop. Fixed source selection and crop; recaptured desktop and mobile headers.
3. First rental-terms pass — P2: “подтверждения” exceeded the left column. Reduced the section-specific display size and widened its safe text box; recapture confirms the word is fully visible.
4. Responsive pass — no P0/P1/P2 findings. Verified 1440 × 1000 and 390 × 844, light/dark contacts, five cards, three-car layout, MAX, and direct `/booking?car=...` CTA.

## Findings

- No actionable P0/P1/P2 findings remain.
- P3: the supplied logo is a raster asset with a large original canvas; the current constrained crop is visually clean, but a transparent production SVG would be sharper on very high-density screens.

## Primary interactions and console

- Theme buttons: light and dark states work; the removed system/monitor option does not render.
- Car detail “Забронировать”: resolves directly to `/booking?car=porsche-911-carrera-4s`.
- MAX and other contact links render; the contact page has no “Перейти к оформлению” link.
- Browser console: no warnings or errors on the checked final states.

## Implementation checklist

- [x] Apply every screenshot caption literally.
- [x] Add MAX number to Contacts as a primary row and channel tile.
- [x] Remove public “заявка/запрос” copy.
- [x] Verify desktop, mobile, light, dark, and booking route.
- [x] Re-run focused comparison after fixing the terms heading overflow.

## Footer correction — 2026-08-13

- Source visual truth: `C:\Users\wthtw\OneDrive\Pictures\Screenshots\Снимок экрана 2026-08-13 000947.png`.
- Compared in one review pass with the rendered desktop and mobile states.
- Restored the original text-based `RPM / RENT` mark in the header and footer; the later raster crop is no longer rendered.
- Removed the footer car image completely. The statement “Ваш маршрут начинается здесь.” is the only content in the large black statement area and is centered horizontally and vertically.
- Preserved the lower footer navigation, company copy, phone, MAX (`+7 993 983-80-80`), Telegram, and address.
- Desktop QA: 1440 × 1000, statement area 1280 × 560, no footer image, no horizontal overflow.
- Mobile QA: 390 × 844, statement area 347 × 320, center offset 7 px from the viewport because of the scrollbar gutter, no horizontal overflow.
- Browser console: no errors or warnings in the final checked state.
- Findings: no actionable P0/P1/P2 issues remain.

final result: passed

## Theme-aware brand and font-preview verification — 2026-08-13

- Browser QA used the in-app browser against the restarted local app at `http://127.0.0.1:3100/`.
- Desktop (1440 × 1000): light chrome rendered with white header/footer and dark chrome with black header/footer. In both states the appropriate RPM logo is legible on its matching surface, navigation and CTA contrast remain correct, and the transparent logo artwork has no visible square canvas. The document `scrollWidth` was 1425 px within the 1440 px viewport.
- Font preview: selected `Наш шрифт`, `Conthrax`, and `Inter`. Each applied the expected root value (`manrope`, `conthrax`, and `inter`), active control, and distinct loaded computed font stack (`Manrope`; `ConthraxPreview, Manrope`; and `InterPreview, Manrope`). The visible type changed with each choice. Reload retained the final `Inter` choice and its active control.
- Mobile (390 × 844): light and dark controls correctly swap the header between white and black; the compact `Шрифт` control opens all three choices; and the mobile menu opens the expected six navigation links. Header and footer logo treatments remain clean, the footer is readable, and `scrollWidth` (383 px) remains within the 390 px viewport.
- Browser console contained no warnings or errors in the checked final mobile state.
- Technical checks: `pnpm typecheck`, `pnpm test` (20 files / 92 tests), `pnpm prisma:validate`, `pnpm exec next build --webpack`, and `git diff --check` passed. `pnpm lint` reported 18,187 problems only from 282 generated `.worktrees/**/.next/**` files; no non-worktree file path appeared in its output, so this external sibling-worktree contamination was recorded as non-gating rather than changed in this task.

final result: passed
