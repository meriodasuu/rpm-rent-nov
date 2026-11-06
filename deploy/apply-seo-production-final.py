from pathlib import Path
import re

root = Path("/opt/rpm-rent")


def transform(path, old, new):
    file_path = root / path
    text = file_path.read_text(encoding="utf-8")
    if text.count(old) != 1:
        raise SystemExit(f"{path}: expected one match, got {text.count(old)}")
    file_path.write_text(text.replace(old, new, 1), encoding="utf-8")


transform("src/app/booking/booking-form.tsx", '      router.push("/spasibo");', '      window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "booking_submit", path: window.location.pathname, timestamp: Date.now() } }));\n      router.push("/spasibo");')
transform("next.config.ts", '      { pathname: "/api/media/yandex" },', '      { pathname: "/api/media/yandex" },\n      // The route validates its `path` parameter before reading storage. Keeping\n      // the query unrestricted lets Next resize uploaded images without opening\n      // the optimizer to arbitrary local paths.\n      { pathname: "/api/media/storage" },')
transform("src/app/globals.css", '.step-card-top > span { color: color-mix(in srgb, var(--ink) 13%, transparent); font-size: 28px; font-weight: 850; }', '.step-card-top > span { color: color-mix(in srgb, var(--ink) 58%, var(--surface)); font-size: 28px; font-weight: 850; }')

for path in [
    "src/app/page.tsx",
    "src/components/car-showcase.tsx",
    "src/components/car-card.tsx",
    "src/components/car-gallery.tsx",
    "src/components/location-gallery.tsx",
    "src/app/booking/booking-form.tsx",
    "src/app/admin/(panel)/cars/page.tsx",
]:
    file_path = root / path
    text = file_path.read_text(encoding="utf-8")
    marker = 'import { isStorageMediaUrl } from "@/lib/admin-media";\n'
    if text.count(marker) != 1:
        raise SystemExit(f"{path}: storage import mismatch")
    text = text.replace(marker, "", 1)
    text, count = re.subn(r" \|\| isStorageMediaUrl\([^()]*\)", "", text)
    if count < 1 or "isStorageMediaUrl" in text:
        raise SystemExit(f"{path}: storage image flag mismatch")
    file_path.write_text(text, encoding="utf-8")

print("Final SEO patch applied")
