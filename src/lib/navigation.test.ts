import { describe, expect, it } from "vitest";
import { closeNavigationMenu, isAdminPath, isNavigationActive } from "./navigation";

describe("isNavigationActive", () => {
  it("matches exact and nested routes", () => {
    expect(isNavigationActive("/cars", "/cars")).toBe(true);
    expect(isNavigationActive("/cars/porsche-911", "/cars")).toBe(true);
  });

  it("does not match a sibling route with the same prefix", () => {
    expect(isNavigationActive("/cars-archive", "/cars")).toBe(false);
    expect(isNavigationActive("/contacts", "/cars")).toBe(false);
  });

  it("matches the home route only exactly", () => {
    expect(isNavigationActive("/", "/")).toBe(true);
    expect(isNavigationActive("/cars", "/")).toBe(false);
  });

  it("matches the admin overview only exactly", () => {
    expect(isNavigationActive("/admin", "/admin")).toBe(true);
    expect(isNavigationActive("/admin/cars", "/admin")).toBe(false);
  });
});

describe("closeNavigationMenu", () => {
  it("closes an open details menu after a mobile navigation choice", () => {
    const menu = { open: true };

    closeNavigationMenu(menu);

    expect(menu.open).toBe(false);
  });

  it("does nothing when the link is outside a details menu", () => {
    expect(() => closeNavigationMenu(null)).not.toThrow();
  });
});

describe("isAdminPath", () => {
  it("recognizes the login screen and every nested admin route", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/login")).toBe(true);
    expect(isAdminPath("/admin/bookings/request-1")).toBe(true);
  });

  it("does not hide the public chrome on similarly named routes", () => {
    expect(isAdminPath("/administrator")).toBe(false);
    expect(isAdminPath("/admin-preview")).toBe(false);
    expect(isAdminPath("/")).toBe(false);
  });
});
