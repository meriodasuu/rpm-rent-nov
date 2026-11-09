import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminSession: vi.fn() }));
vi.mock("@/lib/auth", () => auth);
import { POST } from "./route";

const request = (body: unknown) => new NextRequest("http://localhost/api/admin/media/sign-upload", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("POST /api/admin/media/sign-upload", () => {
  beforeEach(() => auth.getAdminSession.mockReset());

  it("rejects anonymous requests", async () => {
    auth.getAdminSession.mockResolvedValue(null);
    expect((await POST(request({}))).status).toBe(401);
  });

  it("rejects invalid files", async () => {
    auth.getAdminSession.mockResolvedValue({ email: "admin@example.com" });
    const response = await POST(request({ ownerType: "cars", ownerId: "car-1", fileName: "x.svg", mimeType: "image/svg+xml", size: 100 }));
    expect(response.status).toBe(400);
  });

  it("returns an authenticated local upload URL for an authorized upload", async () => {
    auth.getAdminSession.mockResolvedValue({ email: "admin@example.com" });
    const response = await POST(request({ ownerType: "cars", ownerId: "car-1", fileName: "x.jpg", mimeType: "image/jpeg", size: 100 }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({ uploadMode: "local", uploadUrl: expect.stringContaining("/api/admin/media/local-upload?path="), mediaUrl: expect.stringContaining("/api/media/storage?path=") }));
  });
});
