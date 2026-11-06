import { describe, expect, it } from "vitest";
import { getRequestOriginDomain } from "./request-domain";

describe("getRequestOriginDomain", () => {
  it.each([
    ["https://rpm-rent.ru/api/bookings", "rpm-rent.ru"],
    ["https://rpmrent.ru/api/leads", "rpmrent.ru"],
    ["http://localhost/api/bookings", null]
  ])("maps %s to %s", (url, expected) => {
    expect(getRequestOriginDomain(new Request(url))).toBe(expected);
  });

  it("uses the public Host header when Next.js exposes its internal standalone URL", () => {
    const request = new Request("http://0.0.0.0:3000/api/bookings", {
      headers: { host: "rpmrent.ru" },
    });

    expect(getRequestOriginDomain(request)).toBe("rpmrent.ru");
  });
});
