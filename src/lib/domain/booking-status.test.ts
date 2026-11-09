import { describe, expect, it } from "vitest";
import { allowedBookingTransitions, assertBookingStatusTransition } from "./booking-status";

describe("booking lifecycle", () => {
  it("exposes only explicit transitions", () => {
    expect(allowedBookingTransitions.CONFIRMED).toEqual(["COMPLETED", "CANCELLED"]);
    expect(allowedBookingTransitions.DECLINED).toEqual([]);
    expect(allowedBookingTransitions.CANCELLED).toEqual([]);
  });

  it("rejects reopening and backwards transitions", () => {
    expect(() => assertBookingStatusTransition("COMPLETED", "NEW")).toThrow("запрещён");
    expect(() => assertBookingStatusTransition("CONFIRMED", "IN_PROGRESS")).toThrow("запрещён");
  });

  it("allows a no-op retry and a documented next state", () => {
    expect(() => assertBookingStatusTransition("NEW", "NEW")).not.toThrow();
    expect(() => assertBookingStatusTransition("NEW", "IN_PROGRESS")).not.toThrow();
  });
});

