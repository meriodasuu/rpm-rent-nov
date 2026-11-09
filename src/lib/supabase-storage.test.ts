import { afterEach, describe, expect, it, vi } from "vitest";
import { createSignedUpload, removeStorageObject } from "./supabase-storage";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("Supabase Storage boundary", () => {
  it("fails closed when privileged configuration is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(createSignedUpload("cars/car-1/file.jpg")).rejects.toThrow("Supabase Storage не настроен");
  });

  it("uses the service role only on the server", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret-service-key";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ url: "/object/upload/sign/rpm-media/cars/car-1/file.jpg?token=upload-token" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createSignedUpload("cars/car-1/file.jpg")).resolves.toEqual({
      uploadUrl: "https://project.supabase.co/storage/v1/object/upload/sign/rpm-media/cars/car-1/file.jpg?token=upload-token",
      token: "upload-token",
    });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/object/upload/sign/rpm-media/cars/car-1/file.jpg"), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer secret-service-key", apikey: "secret-service-key" }),
    }));
  });

  it("removes only the requested storage object", async () => {
    process.env.SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret";
    const fetchMock = vi.fn(async () => new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await removeStorageObject("locations/location-1/file.webp");
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/object/rpm-media"), expect.objectContaining({
      method: "DELETE",
      body: JSON.stringify({ prefixes: ["locations/location-1/file.webp"] }),
    }));
  });
});
