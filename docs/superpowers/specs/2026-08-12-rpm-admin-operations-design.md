# RPM Rent Admin Operations Design

## Outcome

Transform the existing technical CMS into an operational workspace for a rental manager. The first release must let an administrator understand the day in under ten seconds, process new requests with fewer clicks, see fleet occupancy, and safely maintain cars and public content.

## Primary user

The primary user is a desktop-based RPM Rent administrator or manager who repeatedly:

1. Checks new rental requests.
2. Contacts a customer by phone or Telegram.
3. Confirms, declines, cancels, or completes a request.
4. Checks whether a vehicle is occupied on a date.
5. Updates vehicle pricing, conditions, visibility, services, and FAQ entries.

Urgent actions must remain usable on a narrow screen, but detailed catalog editing remains desktop-first.

## Product principles

- Organize the interface around work to be done, not database entities.
- Make statuses readable in Russian and never expose internal enum values.
- Use red for primary actions and genuine attention states, not decoration.
- Prefer progressive disclosure over wide tables and walls of forms.
- Every save or state transition must produce visible feedback.
- Do not imply capabilities the persistence layer does not provide.

## Information architecture

The authenticated admin shell uses a persistent sidebar with:

- **Сегодня**: actionable overview and today's operational timeline.
- **Заявки**: searchable request workspace with filters and detail panel.
- **Календарь**: fourteen-day fleet occupancy matrix.
- **Автопарк**: vehicle status, rate, next booking, publication health, and editing.
- **Контент**: services and FAQ maintained through compact expandable editors.
- **Открыть сайт**: external link to the public website.

The public header and footer are never rendered on any `/admin` route, including login. Login is a focused branded surface without development-only copy.

## Screen design

### Today dashboard

The page opens with a short greeting and current date. Four actionable summary cards show:

- requests requiring attention;
- confirmed pickups today;
- expected returns today;
- vehicles currently occupied.

Cards link to the relevant filtered workspace. Below them, an attention queue lists the newest requests that still need action. A compact daily timeline shows pickups and returns with the car and customer. Empty states explain that no action is needed.

### Booking workspace

The request page replaces the wide table with a two-column workspace:

- left: search, status filters with counts, and compact request cards;
- right: selected request details and actions.

Each request card shows customer, vehicle, dates, total, current status, and age of the request. Search matches customer name, phone, Telegram, vehicle, and request ID. Filters cover attention, today, all, and each lifecycle status.

The detail panel shows contact links, driver requirements, delivery details, price breakdown, services, comment, source, consent timestamp, and allowed status transitions. Status changes continue to use authenticated server actions and domain transition rules.

### Availability calendar

The calendar shows fourteen consecutive days. Cars form rows and dates form columns. Confirmed requests occupy strong red cells; new and in-progress requests occupy softer attention cells. Cancelled, declined, and completed requests do not block future availability. Each occupied cell links to the matching request in the workspace.

The first release does not support drag-and-drop or manual maintenance blocks. Those require persistent scheduling entities and are deferred.

### Fleet

The fleet view keeps a table-like density but adds vehicle thumbnails, readable availability/publication badges, daily rate, next active request, data-health warning, and a clear edit action. The add-car action remains prominent.

The existing car editor remains the source of truth in this release. Its fields are regrouped visually into named sections with a sticky save area; media upload and drag reordering are deferred.

### Content

Services and FAQ entries are displayed as compact expandable editors instead of all being open simultaneously. New-entry forms stay visible at the end of each section. Delete actions retain explicit labels and are visually separated from save actions.

## Visual system

- Canvas: warm light gray.
- Sidebar: near black with white RPM branding.
- Primary action: RPM red.
- Success: muted green.
- Attention: amber/red tint with text labels.
- Surfaces: white, 12-16px radius, restrained border and shadow.
- Desktop content density: compact 12-14px operational text with 44px minimum interactive targets.
- Motion: 150-200ms transitions for hover, panel selection, and focus only.
- Responsive behavior: sidebar becomes a top horizontal navigation strip; request detail moves below the list.

## Accessibility

- Active navigation uses `aria-current` and a visual marker.
- Status meaning is expressed with text as well as color.
- Search and filter controls have explicit labels.
- Request cards are keyboard focusable links or buttons.
- Focus rings remain visible against dark and light surfaces.
- Horizontal calendar and fleet tables retain keyboard-scrollable wrappers.
- Empty states, pending states, and save confirmations are exposed as readable text.

## Data and performance

- Server pages fetch independent collections with `Promise.all`.
- Client components receive only serializable booking data needed for interaction.
- Filtering and calendar computations live in pure helpers with deterministic tests.
- Server actions continue to call `requireAdmin` and domain transition validation.
- No new frontend dependency is introduced.
- PostgreSQL is required before production administrators rely on persisted requests or edits; this redesign does not disguise the limitations of file-backed storage on Vercel.

## First-release scope

Included:

- isolated admin login and shell;
- actionable dashboard;
- interactive request workspace;
- fourteen-day availability calendar;
- improved fleet overview;
- progressive-disclosure content editing;
- responsive and accessible admin styling;
- automated tests and browser QA.

Deferred:

- payments and contract generation;
- multiple roles and audit history;
- persistent manager notes;
- manual maintenance blocks;
- media upload and drag reordering;
- CRM integrations and automated notifications.

## Acceptance criteria

- An administrator can identify all urgent requests from the first screen.
- A request can be found by customer, phone, vehicle, or ID.
- Allowed status transitions remain enforced.
- Fleet occupancy is visible for the next fourteen days.
- Public site chrome is absent from all admin routes.
- Existing public pages and booking behavior remain unchanged.
- Unit tests, lint, type checking, production build, and desktop/mobile browser checks pass.
