# Theme-aware logo and font preview — design

## Goal

Replace the temporary text logo with the supplied RPM logo, make the public header and footer visibly follow the active theme, and add a temporary font selector alongside the existing theme control.

## Confirmed visual mapping

| Active theme | Header and footer | Logo asset | Navigation and controls |
| --- | --- | --- | --- |
| Light | white | `RPMrent_Логотип_Черный на белом фоне.png` | dark text and borders |
| Dark | black | `RPMrent_Логотип_Белый на черном фоне.png` | light text and borders |

The supplied filenames describe the correct visual pairing: the black-on-white file is used on white chrome, and the white-on-black file is used on black chrome. The image background must blend into the matching surface with no contrasting square visible.

## Assets

- Supplied public folder: `https://disk.yandex.ru/d/I2lE7isueVRbVA`.
- Logo source files are square PNGs, 8334 × 8334 px. They will be cropped once to their useful artwork bounds and saved as optimized local project assets. The source files themselves remain unchanged.
- `Conthrax.zip` contains `conthrax-sb.ttf`; it supports the Cyrillic copy used by the website.
- `Inter.zip` contains an Inter variable font with Cyrillic support. The variable file is preferred to avoid bundling a large set of static weights.

## Logo treatment

`Logo` remains a reusable link component shared by the public header, public footer, and admin header. It will render the local raster logo via `next/image`, with its source switched only through CSS/theme-aware responsive markup. The visual slot stays compact: it is sized from the cropped logo aspect ratio, not from the original square canvas. It remains an accessible link labelled “RPM Rent — на главную”.

The admin header stays dark and will use the white-on-black logo regardless of the public theme, so the administration chrome remains readable.

## Theme-aware public chrome

The public header and footer will stop using unconditional black declarations. Their backgrounds, borders, text, navigation, theme control, mobile menu, and header CTA will derive from explicit light and dark chrome tokens.

Light mode will read as clearly light: white header/footer, subtle gray borders, dark navigation and dark-outline controls. Dark mode will retain the existing black presentation and white action treatment. The red RPM accent remains the only strong color and is reused for hover and active states.

The hero and other deliberately dark content sections are not recolored by this feature.

## Temporary font preview

Create a small client component beside `ThemeToggle` in the public header. It exposes exactly three choices:

1. `Наш шрифт` — the current Manrope configuration.
2. `Conthrax`.
3. `Inter`.

The component applies the chosen font through a `data-font` value on the document root and persists the choice in local storage. On a fresh visit or inaccessible storage it safely falls back to `Наш шрифт`.

The CSS maps the root value to a single global font token, so the selection affects the whole public site and does not change content or layout structure. The temporary control is isolated in `font-preview-toggle.tsx` and has a unique class namespace, allowing its complete removal later by deleting that component import and its focused styles.

## Responsiveness and accessibility

- On desktop the compact font control appears immediately adjacent to the light/dark switch.
- On mobile it remains usable without forcing the header to overflow; the control collapses to an icon/button that opens the three labeled choices.
- Every option has a text label, keyboard-accessible button semantics, `aria-pressed`, and a visible focus state.
- The logo image uses descriptive alt text; decorative black/white image backgrounds are part of the supplied asset and must not show as a separately bounded tile.

## Testing and verification

- Add focused unit tests for default font selection, saved selection restoration, and applying a selected value.
- Extend logo/footer rendering coverage to assert that the theme-specific logo assets are present and the legacy text mark is absent.
- Verify both themes on desktop and mobile in a browser, including the three font choices, mobile menu, and no horizontal overflow.
- Run TypeScript, lint, full tests, Prisma validation, and production build before commit.

## Out of scope

- This is only a temporary preview selector; it does not create an admin setting or a permanent user preference feature.
- Booking availability, car pricing, content, and unrelated page designs are unchanged.
