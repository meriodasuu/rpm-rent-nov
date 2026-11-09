import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { readLocalMedia, removeLocalMedia, writeLocalMedia } from "./local-media";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("readLocalMedia", () => {
  test("reads a migrated media file below the configured root", async () => {
    const root = await mkdtemp(join(tmpdir(), "rpm-media-"));
    temporaryDirectories.push(root);
    await mkdir(join(root, "cars", "car-1"), { recursive: true });
    await writeFile(join(root, "cars", "car-1", "photo.jpg"), "image-data");

    const media = await readLocalMedia("cars/car-1/photo.jpg", root);

    expect(media?.body.toString()).toBe("image-data");
    expect(media?.contentType).toBe("image/jpeg");
  });

  test.each(["../secret", "/etc/passwd", "cars/../../secret", "cars\\..\\secret"])(
    "rejects a path outside the media root: %s",
    async (path) => {
      const root = await mkdtemp(join(tmpdir(), "rpm-media-"));
      temporaryDirectories.push(root);

      await expect(readLocalMedia(path, root)).resolves.toBeNull();
    },
  );

  test("writes and removes a media file below the configured root", async () => {
    const root = await mkdtemp(join(tmpdir(), "rpm-media-"));
    temporaryDirectories.push(root);

    await expect(writeLocalMedia("cars/car-1/photo.jpg", new Uint8Array([1, 2, 3]), root)).resolves.toBe(true);
    await expect(readLocalMedia("cars/car-1/photo.jpg", root)).resolves.toMatchObject({ body: Buffer.from([1, 2, 3]) });
    await expect(removeLocalMedia("cars/car-1/photo.jpg", root)).resolves.toBe(true);
    await expect(readLocalMedia("cars/car-1/photo.jpg", root)).resolves.toBeNull();
  });

  test("does not write outside the media root", async () => {
    const root = await mkdtemp(join(tmpdir(), "rpm-media-"));
    temporaryDirectories.push(root);

    await expect(writeLocalMedia("../secret.jpg", new Uint8Array([1]), root)).resolves.toBe(false);
  });
});
