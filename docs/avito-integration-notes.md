# Avito API: read-only monitoring of own listings

Research date: **2026-08-20**. Scope: only the official Avito developer portal, Avito API host, Avito API terms, and first-party material. No wrappers, scraping, private endpoints, or reverse-engineered APIs are part of this contract.

## Executive conclusion

Avito Business API exposes documented read-only operations for listing the authorized owner's ads and reading one ad's operational state. These operations are sufficient for linking by Avito item ID and monitoring basic metadata such as status, URL, title, and price (the latter two come from the list response).

They are **not a documented full-card content API**. The applicable response schemas do not expose description, images, or vehicle attributes such as make, model, year, horsepower, transmission, or drive type. Those fields must not be invented, scraped, or treated as available. For RPM Rent MVP, unsupported comparisons must be `NOT_AVAILABLE`/disabled until Avito confirms another official product or contract for this account.

## Official sources

- [Avito developer portal — API catalog](https://developers.avito.ru/api-catalog)
- [Authentication API](https://developers.avito.ru/api-catalog/auth/documentation)
- [Items API](https://developers.avito.ru/api-catalog/item/documentation)
- [User/account API](https://developers.avito.ru/api-catalog/user/documentation)
- [Avito API terms of use](https://www.avito.ru/legal/pro_tools/public-api)
- [Avito API terms PDF](https://www.avito.st/static/ims/openapi_apitermsofservicev1_common.pdf)

The portal is protected by anti-bot controls and did not remain consistently renderable from the research environment. Consequently, links above are the authoritative references, while any item explicitly not established from the accessible official contract is marked `UNKNOWN` below. The API routes were also probed without credentials against `api.avito.ru`; the token route returned the documented OAuth error shape and protected read routes returned `401 Bad bearer token`. This verifies route/auth presence, not successful account access or response payloads.

## Confirmed read-only contract

Base URL: `https://api.avito.ru`

All protected calls use:

```http
Authorization: Bearer <access_token>
Accept: application/json
```

### Authentication

#### RPM Rent's own account: client credentials

```http
POST https://api.avito.ru/token/
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=<client_id>
&client_secret=<client_secret>
```

- `client_id` and `client_secret` are obtained in the Avito account/developer setup and must remain server-side.
- Access token lifetime is **24 hours**.
- There is no refresh-token flow for `client_credentials`; request a new access token with the same grant before/after expiry.
- The `ClientCredentials` security scheme has no OAuth user-consent scopes. Access is still constrained by the products/permissions enabled for the Avito account.

This is the preferred flow for a server-side integration monitoring RPM Rent's own Avito account.

#### Third-party/user authorization: authorization code

The official auth section also documents OAuth authorization-code access for an application acting for another Avito user:

- authorization endpoint: `https://avito.ru/oauth`;
- token and refresh requests: `POST https://api.avito.ru/token/` with `grant_type=authorization_code` or `grant_type=refresh_token`;
- access token lifetime: **24 hours**;
- refresh token lifetime: **1 year**;
- a refresh response contains a new access token and a new refresh token; persist the rotated refresh token securely;
- required read scope for the Items operations: `items:info`.

This flow is unnecessary for a single first-party RPM account unless Avito/account hierarchy rules require authorization on behalf of a different owner.

### Resolve the authenticated account

```http
GET https://api.avito.ru/core/v1/accounts/self
```

Use the returned numeric account ID as `user_id` where an endpoint requires it. Do not derive it from a login, URL, or employee ID. Access through this route requires an authenticated account and the applicable user-read permission; for authorization-code integrations the relevant documented scope is `user:read`.

### List the authorized owner's ads

```http
GET https://api.avito.ru/core/v1/items
```

Documented query parameters:

| Parameter | Contract |
| --- | --- |
| `per_page` | Optional integer `> 0` and `< 100`; default `25`. Therefore the documented maximum is `99`, not `100`. |
| `page` | Optional integer `> 0`; default `1`. |
| `status` | Optional comma-separated statuses; default `active`. Documented values: `active`, `removed`, `old`, `blocked`, `rejected`. |
| `category` | Optional integer Avito category ID. |

The method returns listings only for the user who owns them. In an account hierarchy, authorization as an employee does not make that employee the owner; the official method notes that such a request may return an empty list and that the company/main account is the owner to use.

Documented response shape relevant to monitoring:

```ts
type AvitoItemsPage = {
  meta?: {
    page?: number;
    per_page?: number;
  };
  resources?: Array<{
    address?: string;
    category?: { id?: number; name?: string };
    id?: number;
    price?: number | null;
    status?: "active" | "removed" | "old" | "blocked" | "rejected";
    title?: string;
    url?: string;
    vas?: unknown[] | null;
  }>;
};
```

Only fields explicitly represented by the Avito response schema should be accepted. `price: null` means that a price is not specified; it is not zero.

Pagination is page-based. Increment `page`, retaining the same filters, until `resources` is empty or contains fewer than the requested `per_page`. The accessible contract confirms `meta.page` and `meta.per_page`; a reliable `total` or `pages` field was **not confirmed**, so the connector must not depend on either.

Rate limit: **25 requests per minute** for this endpoint. A `429` response means the limit was exceeded. The endpoint documents `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers on the rate-limited response; clients should also honor `Retry-After` if Avito supplies it at runtime, but its guaranteed presence/value is `UNKNOWN`.

Authorization:

- `ClientCredentials`: allowed, with no OAuth scope list in that security scheme;
- `AuthorizationCode`: requires `items:info`.

### Get one ad's operational state

```http
GET https://api.avito.ru/core/v1/accounts/{user_id}/items/{item_id}/
```

Path parameters are numeric Avito account ID and numeric Avito item ID. The method is for an ad belonging to the specified account.

Documented response shape:

```ts
type AvitoItemInfo = {
  autoload_item_id?: string | null;
  start_time?: string | null;  // date-time
  finish_time?: string | null; // date-time
  status?:
    | "active"
    | "removed"
    | "old"
    | "blocked"
    | "rejected"
    | "not_found"
    | "another_user";
  url?: string | null;
  vas?: unknown[] | null;
};
```

Important: despite its name, this method does **not** document title, price, description, images, or vehicle characteristics. Title/price required for monitoring must come from the list operation's resource, not be assumed to exist here.

Rate limit: **500 requests per minute**. The operation documents `429` for exceeding the limit.

Authorization:

- `ClientCredentials`: allowed;
- `AuthorizationCode`: requires `items:info`.

## Field/capability matrix for RPM monitoring

| Capability | Official read source | Result |
| --- | --- | --- |
| External item ID | `GET /core/v1/items` → `resources[].id` | Confirmed |
| Listing URL | list `resources[].url`; detail `url` | Confirmed |
| Listing title | list `resources[].title` | Confirmed |
| Price | list `resources[].price` (`integer \| null`) | Confirmed |
| Publication/moderation status | list/detail `status` | Confirmed |
| Category | list `resources[].category` | Confirmed |
| Address | list `resources[].address` | Confirmed, likely not needed for RPM vehicle comparison |
| Start/finish timestamps | detail `start_time`, `finish_time` | Confirmed |
| Applied paid services | list/detail `vas` | Confirmed, not a master-car comparison field |
| Description | none in the applicable schemas | `UNAVAILABLE_ON_PLATFORM` for this contract |
| Images / image count / primary image | none in the applicable schemas | `UNAVAILABLE_ON_PLATFORM` for this contract |
| Brand/model/year | none in the applicable schemas | `UNAVAILABLE_ON_PLATFORM` for this contract |
| Horsepower/transmission/drive | none in the applicable schemas | `UNAVAILABLE_ON_PLATFORM` for this contract |
| Deposit/rental restrictions/mileage limit | none in the applicable schemas | `UNAVAILABLE_ON_PLATFORM` for this contract |
| Actual rental availability | no dedicated field | `UNKNOWN`; publication status is not rental availability |

Do not interpret `active` as "the vehicle is available to rent". It means the Avito publication is active. Similarly, `blocked`/`rejected` are publication/moderation states, not RPM fleet availability.

## Status handling recommendation

Preserve Avito status verbatim in the raw snapshot, then normalize only publication state:

| Avito status | Safe normalized meaning |
| --- | --- |
| `active` | Published/active on Avito |
| `removed` | Removed from publication |
| `old` | Expired/old publication state |
| `blocked` | Blocked publication |
| `rejected` | Rejected publication |
| `not_found` | Item not found by detail lookup |
| `another_user` | Item belongs to another account |

Any mapping to RPM's `available` field is a separate business policy and should default to no comparison until RPM explicitly defines it.

## Account, tariff, and access requirements

Confirmed:

- this is Avito API for Business and is governed by the official API terms;
- credentials/access are issued through Avito's account/developer setup;
- item methods operate on the authorized owner account;
- account hierarchy matters: use the main/company owner account, not an employee identity, for the own-items list.

`UNKNOWN` / must be confirmed with Avito for RPM Rent:

- the exact paid tariff name currently required for RPM Rent's vehicle-rental category;
- whether RPM Rent's current Avito account has API for Business enabled;
- whether `client_id`/`client_secret` can already be issued in that account;
- whether the account hierarchy grants the main account access to every shop listing expected by RPM;
- whether Avito offers RPM Rent an additional first-party API/product exposing rendered description, images, and vehicle/rental attributes;
- whether category-specific permissions or commercial approval are required beyond the generic Items API access.

Do not encode tariff names from third-party articles. Avito can change commercial eligibility independently of the API schema. Obtain written confirmation from Avito support/account manager for the actual RPM account and category.

## Rate-limit and reliability policy

- Enforce endpoint-specific budgets: `25 rpm` for list and `500 rpm` for detail.
- Treat `429` as `RATE_LIMITED`; use server-provided retry guidance when present and otherwise apply bounded exponential backoff.
- Cache/reuse access tokens until near expiry; do not call `/token/` for every item.
- Page through the list serially or with very low concurrency because the list budget is the binding constraint.
- Validate every JSON response at runtime; fields are optional/nullable in the contract and must not be coerced into invented values.
- Never log bearer tokens, client secrets, refresh tokens, or complete authorization headers.

## What was and was not verified live

Verified against the first-party API host without credentials on 2026-08-20:

- `POST https://api.avito.ru/token/` is present and returns an OAuth `invalid_request` response when required credentials are omitted;
- `GET https://api.avito.ru/core/v1/accounts/self` is protected by Bearer auth;
- `GET https://api.avito.ru/core/v1/items` is protected by Bearer auth;
- `GET https://api.avito.ru/core/v1/accounts/0/items/0/` reaches a protected route and rejects the missing token.

Not verified live:

- successful token issuance;
- successful list/detail responses for RPM Rent;
- actual RPM account ownership hierarchy;
- enabled scopes/products/tariff;
- response examples with real vehicle-rental listings;
- runtime rate-limit headers and retry timing.

Therefore the integration status remains **AVITO CREDENTIALS AND ACCOUNT ACCESS REQUIRED**. Fixture-backed implementation may use only the fields above, but live readiness requires RPM credentials plus at least one known listing ID and written confirmation of account/product eligibility.

## Blocking questions for Avito / RPM Rent

1. Is API for Business enabled for the exact RPM Rent owner/shop account, and which account is the listing owner?
2. Can that account issue `client_id` and `client_secret` for `client_credentials`?
3. Is `GET /core/v1/items` enabled for RPM's vehicle-rental category and tariff?
4. Does Avito provide an official account-specific endpoint/product that returns rendered description, images, and vehicle/rental attributes? If yes, request its current OpenAPI contract and required scopes in writing.
5. What list/detail rate limits and response headers apply contractually to RPM's production credentials if they differ from the public catalog?

Until questions 1–3 are answered, show the connector as `NOT_CONFIGURED`. Until question 4 is answered with an official contract, compare only listing ID/URL/title/price/publication status and mark all content/media/vehicle fields as unavailable.
