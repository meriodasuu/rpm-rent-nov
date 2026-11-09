import { describe, expect, it } from "vitest";
import { FixedWindowRateLimiter } from "./rate-limit";

describe("FixedWindowRateLimiter", () => {
  it("blocks after the configured number and resets after the window", () => {
    const limiter = new FixedWindowRateLimiter(2, 1_000);
    expect(limiter.attempt("client", 0).allowed).toBe(true);
    expect(limiter.attempt("client", 1).allowed).toBe(true);
    expect(limiter.attempt("client", 2)).toMatchObject({ allowed: false, retryAfterSeconds: 1 });
    expect(limiter.attempt("client", 1_001).allowed).toBe(true);
  });

  it("isolates keys and supports clearing a successful login", () => {
    const limiter = new FixedWindowRateLimiter(1, 1_000);
    limiter.attempt("a", 0);
    expect(limiter.attempt("b", 0).allowed).toBe(true);
    limiter.clear("a");
    expect(limiter.attempt("a", 10).allowed).toBe(true);
  });
});

