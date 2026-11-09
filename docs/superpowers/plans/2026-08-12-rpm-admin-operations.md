# RPM Rent Admin Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current technical CMS-style admin with a task-oriented RPM Rent operations workspace.

**Architecture:** Keep authenticated data access in server components and server actions, introduce one focused client workspace for request filtering/selection, and centralize deterministic summary/calendar/filter logic in a pure admin operations module. Reuse the existing store and domain transition rules without adding dependencies.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Lucide React, existing DataStore and server actions.

## Global Constraints

- Do not render public header or footer on `/admin` routes.
- Do not expose internal booking enum values to administrators.
- Keep every admin server action authenticated with `requireAdmin`.
- Introduce no new frontend dependency.
- Preserve public-site behavior and existing booking transition rules.
- Use test-first development for new pure behavior.

---

### Task 1: Pure operations model

**Files:**
- Create: `src/lib/admin-operations.ts`
- Create: `src/lib/admin-operations.test.ts`

**Interfaces:**
- Produces: `AdminBookingFilter`, `getAdminSummary`, `filterAdminBookings`, `buildCalendarDays`, `bookingOccupiesDay`, `getBookingAgeLabel`, `getNextActiveBooking`.
- Consumes: `Booking`, `BookingStatus`, and `Car` from `src/types/domain.ts`.

- [ ] **Step 1: Write failing tests for actionable summary counts**

```ts
const summary = getAdminSummary(bookings, cars, new Date("2026-08-12T09:00:00+03:00"));
expect(summary).toMatchObject({ attention: 2, pickupsToday: 1, returnsToday: 1, occupiedCars: 1 });
```

- [ ] **Step 2: Run `vitest run src/lib/admin-operations.test.ts` and verify missing-export failures**

- [ ] **Step 3: Implement summary classification using local `YYYY-MM-DD` comparison and active statuses**

- [ ] **Step 4: Add failing tests for search/status filtering, calendar day coverage, age labels, and next active booking**

```ts
expect(filterAdminBookings(bookings, "attention", "porsche", now)).toHaveLength(1);
expect(bookingOccupiesDay(confirmed, "2026-08-13")).toBe(true);
expect(buildCalendarDays(new Date("2026-08-12T09:00:00+03:00"), 14)).toHaveLength(14);
```

- [ ] **Step 5: Implement the minimal pure helpers and rerun the focused tests until green**

- [ ] **Step 6: Run the complete test suite and commit**

```bash
git add src/lib/admin-operations.ts src/lib/admin-operations.test.ts
git commit -m "feat: add admin operations model"
```

### Task 2: Isolated admin shell and navigation

**Files:**
- Modify: `src/components/site-chrome.tsx`
- Create: `src/components/admin/admin-navigation.tsx`
- Modify: `src/components/admin/admin-header.tsx`
- Modify: `src/app/admin/(panel)/layout.tsx`
- Modify: `src/app/admin/login/page.tsx`
- Modify: `src/lib/navigation.ts`
- Modify: `src/lib/navigation.test.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `isAdminPath(pathname: string): boolean` and an active, responsive admin navigation.
- Consumes: existing `logoutAction`, `Logo`, `usePathname`, and admin routes.

- [ ] **Step 1: Add failing tests proving `/admin` and nested paths are admin routes while `/administration` is not**

```ts
expect(isAdminPath("/admin/bookings")).toBe(true);
expect(isAdminPath("/administration")).toBe(false);
```

- [ ] **Step 2: Run the navigation test and verify it fails because `isAdminPath` is missing**

- [ ] **Step 3: Implement `isAdminPath` and use it in a client `SiteChrome` to omit public chrome**

- [ ] **Step 4: Build `AdminNavigation` with Today, Requests, Calendar, Fleet, Content, and public-site links; mark active links with `aria-current`**

- [ ] **Step 5: Replace the old header with the sidebar/topbar shell and remove `.env.local` copy from login**

- [ ] **Step 6: Add responsive shell styles, run navigation tests and type checking, then commit**

```bash
git add src/components src/app/admin src/lib/navigation.ts src/lib/navigation.test.ts src/app/globals.css
git commit -m "feat: add operational admin shell"
```

### Task 3: Today dashboard and availability calendar

**Files:**
- Modify: `src/app/admin/(panel)/page.tsx`
- Create: `src/app/admin/(panel)/calendar/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: all Task 1 pure helpers and `DataStore.getCars/getBookings`.
- Produces: actionable dashboard cards, attention queue, daily timeline, and fourteen-day occupancy grid.

- [ ] **Step 1: Replace vanity dashboard counts with `getAdminSummary` results and links to filtered request states**

- [ ] **Step 2: Add the attention queue ordered newest-first with customer, vehicle, period, and age label**

- [ ] **Step 3: Add the pickup/return timeline with explicit empty state**

- [ ] **Step 4: Create the calendar page using `buildCalendarDays` and `bookingOccupiesDay`; link occupied cells to `/admin/bookings?booking=<id>`**

- [ ] **Step 5: Style dashboard cards and scrollable calendar, run tests/typecheck, and commit**

```bash
git add src/app/admin/(panel)/page.tsx src/app/admin/(panel)/calendar/page.tsx src/app/globals.css
git commit -m "feat: add admin dashboard and calendar"
```

### Task 4: Interactive booking workspace

**Files:**
- Create: `src/components/admin/admin-bookings-workspace.tsx`
- Modify: `src/app/admin/(panel)/bookings/page.tsx`
- Modify: `src/app/admin/actions.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `filterAdminBookings`, `getBookingAgeLabel`, `bookingStatusLabels`, `allowedBookingTransitions`, and `updateBookingStatusAction`.
- Produces: searchable/filterable request list and selected request detail panel.

- [ ] **Step 1: Server-render bookings and pass the serializable array plus initial query filter/booking ID to the client workspace**

- [ ] **Step 2: Add labelled search and status filters with visible counts**

- [ ] **Step 3: Render selectable request cards with customer, period, amount, age, and text status badge**

- [ ] **Step 4: Render contact links, price breakdown, rental requirements, delivery, services, source, consent, and comments in the detail panel**

- [ ] **Step 5: Render only allowed lifecycle transitions as authenticated server-action forms and redirect back to the selected request after update**

- [ ] **Step 6: Add empty/no-result states, responsive styling, run lint/typecheck/tests, and commit**

```bash
git add src/components/admin/admin-bookings-workspace.tsx src/app/admin/(panel)/bookings/page.tsx src/app/admin/actions.ts src/app/globals.css
git commit -m "feat: redesign admin booking workflow"
```

### Task 5: Fleet, content, and final verification

**Files:**
- Modify: `src/app/admin/(panel)/cars/page.tsx`
- Modify: `src/components/admin/car-form.tsx`
- Modify: `src/app/admin/(panel)/content/page.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `getNextActiveBooking`, existing save/delete actions, and car images.
- Produces: operational fleet overview, visually grouped car editor, and compact content editors.

- [ ] **Step 1: Add thumbnails, readable status badges, next active booking, rate, data-health warning, and edit action to fleet rows**

- [ ] **Step 2: Group the existing car form into semantic sections and add a sticky save bar without changing its data contract**

- [ ] **Step 3: Wrap service and FAQ editors in named expandable entries while keeping new-entry forms visible**

- [ ] **Step 4: Add desktop/mobile styles and ensure status meaning is never color-only**

- [ ] **Step 5: Run `pnpm lint`, `pnpm test`, `pnpm typecheck`, and `pnpm build`**

- [ ] **Step 6: Browser-check login, dashboard, booking selection/filtering, calendar scrolling, fleet, and mobile navigation with zero console errors**

- [ ] **Step 7: Commit the verified release slice**

```bash
git add src/app/admin src/components/admin src/app/globals.css
git commit -m "feat: finish RPM admin operations workspace"
```
