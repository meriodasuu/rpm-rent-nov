# Location admin details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add address, map link, directions and working hours to editable location records and show them on public location pages.

**Architecture:** Extend the `Location` domain contract and Prisma schema with nullable strings so current rows remain valid. Pass the fields through validation, the server action and both stores; render only populated public details.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod 4, Prisma 7, PostgreSQL, Vitest.

## Global Constraints

- Preserve all existing location data and behavior.
- Accept only absolute `https` URLs for map links.
- Do not add a rating field.
- Hide every public detail whose value is absent.
- Use `pnpm` scripts from `package.json` for verification.

---

## File structure

- `prisma/schema.prisma` and a new migration persist nullable location details.
- `src/types/domain.ts`, `src/lib/validation.ts`, `src/app/admin/actions.ts`, `src/lib/data/prisma-store.ts` carry them through the domain boundary.
- `src/app/admin/(panel)/locations/page.tsx` exposes add/edit controls.
- `src/app/locations/[slug]/page.tsx` conditionally renders public information.
- `src/lib/location.test.ts` protects validation behavior.

### Task 1: Add data contract and validation

**Files:** Modify `src/types/domain.ts`, `src/lib/validation.ts`, `src/lib/location.test.ts`.

**Produces:** `Location.address`, `Location.mapUrl`, `Location.directions`, `Location.workingHours`, each `string | null`; matching `locationAdminSchema` properties.

- [ ] **Step 1: Write the failing test**

```ts
it("accepts contact details and rejects a non-https map URL", () => {
  expect(locationAdminSchema.safeParse({ ...base, address: "Невский, 1", mapUrl: "https://yandex.ru/maps/-/example", directions: "Вход со двора", workingHours: "10:00–22:00" }).success).toBe(true);
  expect(locationAdminSchema.safeParse({ ...base, mapUrl: "http://2gis.ru/example" }).success).toBe(false);
});
```

- [ ] **Step 2: Verify RED** — Run `pnpm test src/lib/location.test.ts`; expect the new behavior to fail.
- [ ] **Step 3: Implement minimal contract** — add four nullable domain values; use `optionalText(300)` for address/hours, `optionalText(5000)` for directions and an optional `https` URL refinement for `mapUrl`.
- [ ] **Step 4: Verify GREEN** — Run `pnpm test src/lib/location.test.ts`; expect PASS.
- [ ] **Step 5: Commit** — `git add src/types/domain.ts src/lib/validation.ts src/lib/location.test.ts && git commit -m "feat: validate location contact details"`.

### Task 2: Persist details

**Files:** Modify `prisma/schema.prisma`, `src/lib/data/prisma-store.ts`, `src/app/admin/actions.ts`; create `prisma/migrations/<timestamp>_location_details/migration.sql`.

**Consumes:** The nullable properties from Task 1. **Produces:** values that round-trip through PostgreSQL and Prisma.

- [ ] **Step 1: Write the failing mapper test** — assert a location carrying address, map URL, directions and hours returns those exact values after mapping.
- [ ] **Step 2: Verify RED** — Run `pnpm test src/lib/location.test.ts`; expect the values to be absent.
- [ ] **Step 3: Implement minimal persistence** — add nullable `TEXT` columns named `address`, `mapUrl`, `directions`, `workingHours`; map their Prisma record values and include form values in `saveLocationAction`.
- [ ] **Step 4: Verify GREEN** — Run `pnpm prisma:generate && pnpm prisma:validate && pnpm test src/lib/location.test.ts`; expect all commands to exit 0.
- [ ] **Step 5: Commit** — `git add prisma src/lib/data/prisma-store.ts src/app/admin/actions.ts src/lib/location.test.ts && git commit -m "feat: persist location contact details"`.

### Task 3: Expose fields in the admin form and public page

**Files:** Modify `src/app/admin/(panel)/locations/page.tsx` and `src/app/locations/[slug]/page.tsx`.

**Consumes:** Task 2 details. **Produces:** labeled edit controls and a public details block that omits empty values.

- [ ] **Step 1: Write the failing render test** — render a populated location; require the text “Как добраться” and an “Открыть карту” link whose `href` equals the saved map URL.
- [ ] **Step 2: Verify RED** — Run the focused page test; expect it to fail since there is no details block.
- [ ] **Step 3: Implement minimal UI** — add fields with exact labels `Адрес`, `Ссылка на карту`, `Как добраться`, `Часы работы`; show their populated values and a new-tab map link on the public page.
- [ ] **Step 4: Verify GREEN** — Run `pnpm test && pnpm lint && pnpm typecheck && pnpm build`; expect all commands to exit 0.
- [ ] **Step 5: Commit** — `git add src/app/admin/(panel)/locations/page.tsx src/app/locations/[slug]/page.tsx && git commit -m "feat: show location details in admin and site"`.
