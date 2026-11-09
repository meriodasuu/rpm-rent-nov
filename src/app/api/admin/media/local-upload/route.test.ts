import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminSession: vi.fn() }));
const media = vi.hoisted(() => ({ writeLocalMedia: vi.fn() }));
vi.mock("@/lib/auth", () => auth);
vi.mock("@/lib/local-media", () => media);

import { PUT } from "./route";

const request = (path: string, contentType = "image/jpeg", body = new Uint8Array([1, 2, 3])) => new NextRequest(`http://localhost/api/admin/media/local-upload?path=${encodeURIComponent(path)}`, {
  method: "PUT",
  headers: { "content-type": contentType },
  body,
});

describe("PUT /api/admin/media/local-upload", () => {
  beforeEach(() => {
    auth.getAdminSession.mockReset();
    media.writeLocalMedia.mockReset();
    media.writeLocalMedia.mockResolvedValue(true);
  });

  it("rejects anonymous uploads", async () => {
    auth.getAdminSession.mockResolvedValue(null);
    expect((await PUT(request("cars/car-1/123e4567-e89b-12d3-a456-426614174000.jpg"))).status).toBe(401);
  });

  it("stores a validated upload for an administrator", async () => {
    auth.getAdminSession.mockResolvedValue({ email: "admin@example.com" });
    const response = await PUT(request("cars/car-1/123e4567-e89b-12d3-a456-426614174000.jpg"));

    expect(response.status).toBe(204);
    expect(media.writeLocalMedia).toHaveBeenCalledWith("cars/car-1/123e4567-e89b-12d3-a456-426614174000.jpg", new Uint8Array([1, 2, 3]));
  });

  it("rejects an unsupported content type", async () => {
    auth.getAdminSession.mockResolvedValue({ email: "admin@example.com" });
    expect((await PUT(request("cars/car-1/123e4567-e89b-12d3-a456-426614174000.jpg", "image/gif"))).status).toBe(400);
  });
});
