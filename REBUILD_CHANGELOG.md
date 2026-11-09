# RPM Rent — rebuild change manifest

## `/`

- Expanded the page from a short showcase into a full decision journey: hero, catalogue, use cases, trust facts, price model, services, five-step process, terms preview, FAQ and final CTA.
- Added primary and secondary actions and microcopy explaining date checks and manual confirmation.

## `/cars`

- Added a selection guide, period status, active filters, result count, empty state, comparison help and next-step CTA.
- Query context supports category, maximum daily price and dates.

## `/cars/[slug]`

- Added unique editorial copy for all eight cars without invented specifications.
- Added selection reasons, use cases, known-only specifications, conditions, calculation structure, FAQ and related-car ranking.

## `/services`

- Replaced short summaries with detailed audience, ordering and price context.
- Service CTAs pass a service slug to `/booking` for automatic preselection.

## `/booking`

- Added reassurance, structured post-submit expectations and a clearer summary.
- Preserves car, dates and service context; separates rental, services and deposit.
- Added manual native validation before the API call.

## Informational routes

- `/rental-terms`: requirements, cost/deposit, mileage/insurance, pickup, workflow and pre-rental checklist.
- `/about`: company role, principles, process and fleet context.
- `/contacts`: real environment contacts only, plus request preparation and next-step guidance.
- `/faq`: eight useful, owner-safe answers and decision categories.
- `/reviews`: removed from navigation and sitemap; permanent redirect to `/about` until verified reviews exist.

## Shared public system and data

- Updated header/footer CTA language and removed misleading Telegram/reviews labels.
- Updated metadata and sitemap.
- Added `src/lib/content.ts` for car/service editorial context while keeping the primary car lead editable through the existing admin field.
- Updated seed and active file-store FAQ content.
- Expanded `OWNER_RELEASE_INPUT.md` into a release checklist for commercial, operational and legal facts.
