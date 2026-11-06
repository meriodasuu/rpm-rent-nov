import { describe, expect, it } from "vitest";
import { legacyRedirects } from "./redirects";

describe("legacy public redirects", () => {
  it("keeps verified home and catalog equivalents permanent", () => {
    expect(legacyRedirects).toEqual([
      { source: "/home", destination: "/", permanent: true },
      { source: "/category/avto-v-arendu", destination: "/cars", permanent: true },
      { source: "/category/avto-v-arendu/", destination: "/cars", permanent: true },
    ]);
  });
});
