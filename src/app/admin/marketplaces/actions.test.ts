import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdmin } = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAdmin }));

import {
  confirmAvitoLinkAction,
  previewAvitoLinkAction,
  refreshMarketplaceAction,
  unlinkAvitoListingAction,
} from "./actions";

describe("marketplace server action authorization", () => {
  beforeEach(() => {
    requireAdmin.mockReset().mockRejectedValue(new Error("NEXT_REDIRECT"));
  });

  it.each([
    ["refresh", () => refreshMarketplaceAction({ status: "IDLE" }, new FormData())],
    ["preview", () => previewAvitoLinkAction({ status: "IDLE" }, new FormData())],
    ["confirm", () => confirmAvitoLinkAction({ status: "IDLE" }, new FormData())],
    ["unlink", () => unlinkAvitoListingAction({ status: "IDLE" }, new FormData())],
  ])("requires an admin session before %s", async (_name, invoke) => {
    let caught: unknown;
    try {
      await invoke();
    } catch (error) {
      caught = error;
    }
    expect(caught).toMatchObject({ message: "NEXT_REDIRECT" });
    expect(requireAdmin).toHaveBeenCalledOnce();
  });
});
