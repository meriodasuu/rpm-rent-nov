import { describe, expect, it, vi } from "vitest";
import { AvitoConnector } from "./client";
import { MarketplaceConnectorError } from "../contracts";

const tokenResponse = () => new Response(JSON.stringify({ access_token: "redacted-test-token", token_type: "Bearer", expires_in: 3600 }), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});

const pageResponse = (resources: unknown[], page = 1, perPage = 2) => new Response(JSON.stringify({ meta: { page, per_page: perPage }, resources }), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});

const listing = (id: number) => ({
  id,
  title: `Listing ${id}`,
  price: 25_000,
  status: "active",
  url: `https://www.avito.ru/sankt-peterburg/avtomobili/listing_${id}`,
  category: { id: 9, name: "Автомобили" },
});

describe("AvitoConnector", () => {
  it("reports missing server-side credentials as NOT_CONFIGURED", async () => {
    const connector = new AvitoConnector({ clientId: "", clientSecret: "" });
    await expect(connector.healthCheck()).resolves.toEqual({ status: "NOT_CONFIGURED" });
    await expect(connector.listListings()).rejects.toMatchObject({ code: "NOT_CONFIGURED" });
  });

  it("paginates the documented own-items endpoint until a short page", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(pageResponse([listing(123456), listing(123457)], 1, 2))
      .mockResolvedValueOnce(pageResponse([listing(123458)], 2, 2));
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", perPage: 2, fetcher });

    const result = await connector.listListings();

    expect(result.map((item) => item.canonical.externalId)).toEqual(["123456", "123457", "123458"]);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(String(fetcher.mock.calls[1]?.[0])).toContain("page=1");
    expect(String(fetcher.mock.calls[2]?.[0])).toContain("page=2");
  });

  it("returns an empty list for an empty documented response", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(pageResponse([], 1, 2));
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", perPage: 2, fetcher });
    await expect(connector.listListings()).resolves.toEqual([]);
  });

  it("paces paginated item requests to the documented 25 requests per minute", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(pageResponse([listing(123456)], 1, 1))
      .mockResolvedValueOnce(pageResponse([], 2, 1));
    const sleep = vi.fn(async (_milliseconds: number) => undefined);
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", perPage: 1, fetcher, sleep, itemsRequestIntervalMs: 2_400 });
    await connector.listListings();
    expect(sleep).toHaveBeenCalledOnce();
    expect(sleep.mock.calls[0]?.[0]).toBeGreaterThanOrEqual(2_300);
  });

  it("classifies token rejection as AUTH_ERROR", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ error: "invalid_client" }), { status: 401 }));
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", fetcher });
    await expect(connector.listListings()).rejects.toMatchObject({ code: "AUTH_ERROR" });
  });

  it("retries a rate-limited GET only a bounded number of times", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValue(new Response("", { status: 429, headers: { "Retry-After": "1" } }));
    const sleep = vi.fn(async () => undefined);
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", fetcher, sleep, maxRetries: 1 });

    await expect(connector.listListings()).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledOnce();
  });

  it("classifies an aborted GET as TIMEOUT without leaking credentials", async () => {
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      if (String(input).endsWith("/token/")) return tokenResponse();
      return new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))));
    });
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", fetcher, timeoutMs: 5 });
    await expect(connector.listListings()).rejects.toEqual(expect.objectContaining({ code: "TIMEOUT" }));
  });

  it("rejects an unexpected Avito response at the runtime validation boundary", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(pageResponse([{ id: "not-a-number", title: null }], 1, 2));
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", fetcher });
    await expect(connector.listListings()).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("finds one listing by external id without accepting an arbitrary URL", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(pageResponse([listing(123456)], 1, 99));
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", fetcher });
    await expect(connector.getListing("123456")).resolves.toMatchObject({ canonical: { externalId: "123456" } });
  });

  it("keeps only allowlisted listing fields in raw snapshot data", async () => {
    const unsafe = { ...listing(123456), address: "PII-like address", contact: { phone: "+70000000000" }, access_token: "must-not-survive" };
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(pageResponse([unsafe], 1, 99));
    const connector = new AvitoConnector({ clientId: "id", clientSecret: "secret", fetcher });
    const [result] = await connector.listListings();
    expect(result?.rawData).toEqual({
      id: 123456,
      title: "Listing 123456",
      price: 25_000,
      status: "active",
      url: "https://www.avito.ru/sankt-peterburg/avtomobili/listing_123456",
      category: { id: 9, name: "Автомобили" },
    });
  });
});

describe("MarketplaceConnectorError", () => {
  it("exposes only a typed safe code and message", () => {
    const error = new MarketplaceConnectorError("API_ERROR", "Avito временно недоступен");
    expect(error).toMatchObject({ code: "API_ERROR", message: "Avito временно недоступен" });
  });
});
