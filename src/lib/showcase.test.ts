import { describe, expect, it } from "vitest";
import { getShowcaseScrollDistance } from "./showcase";

describe("getShowcaseScrollDistance", () => {
  it("advances by most of the visible track on wide screens", () => {
    expect(getShowcaseScrollDistance(1000)).toBe(780);
  });

  it("keeps controls useful on narrow screens", () => {
    expect(getShowcaseScrollDistance(320)).toBe(280);
  });
});
