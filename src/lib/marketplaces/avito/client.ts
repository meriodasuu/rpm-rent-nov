import { z } from "zod";
import { MarketplaceConnectorError, type ConnectorHealth, type MarketplaceConnector } from "../contracts";
import type { MarketplaceListingObservation } from "../contracts";
import { normalizeAvitoListing, type AvitoRawListing } from "./avito";

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type AvitoConnectorOptions = {
  clientId: string;
  clientSecret: string;
  perPage?: number;
  timeoutMs?: number;
  maxRetries?: number;
  fetcher?: Fetcher;
  sleep?: (milliseconds: number) => Promise<void>;
  itemsRequestIntervalMs?: number;
};

const tokenSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().min(1),
  expires_in: z.number().positive(),
}).passthrough();

const avitoUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && (url.hostname === "avito.ru" || url.hostname.endsWith(".avito.ru"));
}, "Unexpected listing URL");

const rawListingSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).nullable().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  status: z.enum(["active", "removed", "old", "blocked", "rejected"]).optional(),
  url: avitoUrl.nullable().optional(),
  category: z.object({ id: z.number().int().positive().optional(), name: z.string().min(1).optional() }).optional(),
}).passthrough();

const itemsPageSchema = z.object({
  meta: z.object({ page: z.number().int().positive().optional(), per_page: z.number().int().positive().optional() }).optional(),
  resources: z.array(rawListingSchema).default([]),
}).passthrough();

const defaultSleep = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
const safeMessage: Record<ConstructorParameters<typeof MarketplaceConnectorError>[0], string> = {
  NOT_CONFIGURED: "Avito connector не настроен",
  AUTH_ERROR: "Avito отклонил авторизацию",
  NOT_FOUND: "Объявление Avito не найдено в аккаунте",
  RATE_LIMITED: "Превышен лимит запросов Avito",
  API_ERROR: "Avito API временно недоступен",
  TIMEOUT: "Avito API не ответил вовремя",
  INVALID_RESPONSE: "Avito API вернул неожиданный ответ",
  INTERNAL_ERROR: "Внутренняя ошибка мониторинга",
};

let nextItemsRequestAt = 0;

const observedListing = (raw: AvitoRawListing): MarketplaceListingObservation => ({
  canonical: normalizeAvitoListing(raw),
  rawData: {
    id: raw.id,
    ...(raw.title !== undefined ? { title: raw.title } : {}),
    ...(raw.price !== undefined ? { price: raw.price } : {}),
    ...(raw.status !== undefined ? { status: raw.status } : {}),
    ...(raw.url !== undefined ? { url: raw.url } : {}),
    ...(raw.category ? { category: {
      ...(raw.category.id !== undefined ? { id: raw.category.id } : {}),
      ...(raw.category.name !== undefined ? { name: raw.category.name } : {}),
    } } : {}),
  },
});

export class AvitoConnector implements MarketplaceConnector {
  private readonly fetcher: Fetcher;
  private readonly sleep: (milliseconds: number) => Promise<void>;
  private readonly perPage: number;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly itemsRequestIntervalMs: number;
  private token: { value: string; expiresAt: number } | null = null;

  constructor(private readonly options: AvitoConnectorOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.sleep = options.sleep ?? defaultSleep;
    this.perPage = Math.min(99, Math.max(1, options.perPage ?? 99));
    const timeoutMs = options.timeoutMs ?? 10_000;
    this.timeoutMs = Number.isFinite(timeoutMs) ? Math.min(60_000, Math.max(1, timeoutMs)) : 10_000;
    this.maxRetries = Math.min(3, Math.max(0, options.maxRetries ?? 2));
    this.itemsRequestIntervalMs = Math.max(0, options.itemsRequestIntervalMs ?? (options.fetcher ? 0 : 2_400));
  }

  async healthCheck(): Promise<ConnectorHealth> {
    if (!this.configured()) return { status: "NOT_CONFIGURED" };
    try {
      await this.accessToken();
      return { status: "AVAILABLE" };
    } catch (error) {
      if (error instanceof MarketplaceConnectorError && error.code === "AUTH_ERROR") return { status: "AUTH_ERROR" };
      return { status: "API_ERROR" };
    }
  }

  async listListings(): Promise<MarketplaceListingObservation[]> {
    this.assertConfigured();
    const token = await this.accessToken();
    const listings: MarketplaceListingObservation[] = [];
    for (let page = 1; page <= 100; page++) {
      const url = new URL("https://api.avito.ru/core/v1/items");
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(this.perPage));
      url.searchParams.set("status", "active,removed,old,blocked,rejected");
      const payload = await this.getJson(url, token);
      const parsed = itemsPageSchema.safeParse(payload);
      if (!parsed.success) throw this.error("INVALID_RESPONSE");
      listings.push(...parsed.data.resources.map((item) => observedListing(item as AvitoRawListing)));
      if (parsed.data.resources.length < this.perPage) return listings;
    }
    throw this.error("INVALID_RESPONSE");
  }

  async getListing(externalId: string): Promise<MarketplaceListingObservation> {
    if (!/^[1-9]\d{5,19}$/.test(externalId)) throw this.error("NOT_FOUND");
    const listing = (await this.listListings()).find((item) => item.canonical.externalId === externalId);
    if (!listing) throw this.error("NOT_FOUND");
    return listing;
  }

  private configured() {
    return Boolean(this.options.clientId.trim() && this.options.clientSecret.trim());
  }

  private assertConfigured() {
    if (!this.configured()) throw this.error("NOT_CONFIGURED");
  }

  private error(code: ConstructorParameters<typeof MarketplaceConnectorError>[0]) {
    return new MarketplaceConnectorError(code, safeMessage[code]);
  }

  private async accessToken() {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) return this.token.value;
    this.assertConfigured();
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
    });
    const response = await this.fetchWithTimeout("https://api.avito.ru/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    }).catch((error) => {
      if (error instanceof MarketplaceConnectorError) throw error;
      throw this.error("API_ERROR");
    });
    if (response.status === 400 || response.status === 401 || response.status === 403) throw this.error("AUTH_ERROR");
    if (!response.ok) throw this.error("API_ERROR");
    const payload = await response.json().catch(() => null);
    const parsed = tokenSchema.safeParse(payload);
    if (!parsed.success) throw this.error("INVALID_RESPONSE");
    this.token = { value: parsed.data.access_token, expiresAt: Date.now() + parsed.data.expires_in * 1000 };
    return this.token.value;
  }

  private async getJson(url: URL, token: string): Promise<unknown> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      let response: Response;
      try {
        await this.throttleItemsRequest();
        response = await this.fetchWithTimeout(url, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
      } catch (error) {
        if (error instanceof MarketplaceConnectorError && error.code === "TIMEOUT") throw error;
        if (attempt < this.maxRetries) {
          await this.sleep(250 * (2 ** attempt));
          continue;
        }
        throw this.error("API_ERROR");
      }
      if (response.status === 401 || response.status === 403) throw this.error("AUTH_ERROR");
      if (response.status === 404) throw this.error("NOT_FOUND");
      if (response.status === 429) {
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryAfterMilliseconds(response, attempt));
          continue;
        }
        throw this.error("RATE_LIMITED");
      }
      if (response.status >= 500) {
        if (attempt < this.maxRetries) {
          await this.sleep(250 * (2 ** attempt));
          continue;
        }
        throw this.error("API_ERROR");
      }
      if (!response.ok) throw this.error("API_ERROR");
      return response.json().catch(() => { throw this.error("INVALID_RESPONSE"); });
    }
    throw this.error("API_ERROR");
  }

  private retryAfterMilliseconds(response: Response, attempt: number) {
    const header = response.headers.get("retry-after");
    const seconds = header ? Number(header) : Number.NaN;
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(60_000, seconds * 1000);
    return Math.min(60_000, 500 * (2 ** attempt));
  }

  private async throttleItemsRequest() {
    if (!this.itemsRequestIntervalMs) return;
    const now = Date.now();
    const scheduledAt = Math.max(now, nextItemsRequestAt);
    nextItemsRequestAt = scheduledAt + this.itemsRequestIntervalMs;
    if (scheduledAt > now) await this.sleep(scheduledAt - now);
  }

  private async fetchWithTimeout(input: string | URL, init: RequestInit) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await this.fetcher(input, { ...init, signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")) {
        throw this.error("TIMEOUT");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const createAvitoConnectorFromEnv = () => new AvitoConnector({
  clientId: process.env.AVITO_CLIENT_ID?.trim() ?? "",
  clientSecret: process.env.AVITO_CLIENT_SECRET?.trim() ?? "",
  timeoutMs: Number(process.env.AVITO_TIMEOUT_MS) || 10_000,
});

export const isAvitoConfigured = () => Boolean(
  process.env.AVITO_CLIENT_ID?.trim() && process.env.AVITO_CLIENT_SECRET?.trim(),
);
