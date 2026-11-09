import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";

const contentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const resolveLocalMediaPath = (path: string, root: string) => {
  if (!path || path.startsWith("/") || path.includes("\\") || path.includes("\0")) return null;
  const segments = path.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return null;
  const absoluteRoot = resolve(root);
  const absolutePath = resolve(absoluteRoot, ...segments);
  if (!absolutePath.startsWith(`${absoluteRoot}${sep}`)) return null;
  return absolutePath;
};

export const readLocalMedia = async (path: string, root = process.env.LOCAL_MEDIA_ROOT || "/app/media") => {
  const absolutePath = resolveLocalMediaPath(path, root);
  if (!absolutePath) return null;
  try {
    const body = await readFile(/* turbopackIgnore: true */ absolutePath);
    return { body, contentType: contentTypes[extname(absolutePath).toLowerCase()] || "application/octet-stream" };
  } catch {
    return null;
  }
};

export const writeLocalMedia = async (path: string, body: Uint8Array, root = process.env.LOCAL_MEDIA_ROOT || "/app/media") => {
  const absolutePath = resolveLocalMediaPath(path, root);
  if (!absolutePath) return false;
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, body);
  return true;
};

export const removeLocalMedia = async (path: string, root = process.env.LOCAL_MEDIA_ROOT || "/app/media") => {
  const absolutePath = resolveLocalMediaPath(path, root);
  if (!absolutePath) return false;
  try {
    await rm(absolutePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
};
