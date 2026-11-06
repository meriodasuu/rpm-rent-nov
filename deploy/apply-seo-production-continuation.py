from pathlib import Path
import re

root = Path("/opt/rpm-rent")


def read(path: str):
    file_path = root / path
    with file_path.open("r", encoding="utf-8", newline="") as file:
        text = file.read()
    return file_path, text.replace("\r\n", "\n"), "\r\n" if "\r\n" in text else "\n"


def write(file_path: Path, text: str, newline: str):
    with file_path.open("w", encoding="utf-8", newline="") as file:
        file.write(text.replace("\n", newline))


def replace_once(path: str, old: str, new: str):
    file_path, text, newline = read(path)
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected one match, got {count}")
    write(file_path, text.replace(old, new, 1), newline)


replace_once("src/app/personal-data-policy/page.tsx", 'export const metadata: Metadata = { title: "Политика обработки и конфиденциальности персональных данных",', 'export const metadata: Metadata = { title: "Политика обработки и конфиденциальности персональных данных", description: "Политика обработки персональных данных ООО «РПМ ГРУПП» для пользователей сайта RPM Rent.",')
replace_once("src/app/data-processing/page.tsx", 'export const metadata: Metadata = { title: "Политика в отношении обработки данных",', 'export const metadata: Metadata = { title: "Политика в отношении обработки данных", description: "Правила обработки данных пользователей сайта RPM Rent при обращении по аренде автомобиля.",')
replace_once("src/app/booking/booking-form.tsx", '      window.location.assign(new URL("/spasibo", window.location.origin).toString());', '      window.dispatchEvent(new CustomEvent("rpm:analytics-track", { detail: { event: "booking_submit", path: window.location.pathname, timestamp: Date.now() } }));\n      window.location.assign(new URL("/spasibo", window.location.origin).toString());')
replace_once("next.config.ts", '      { pathname: "/api/media/yandex" },', '      { pathname: "/api/media/yandex" },\n      // The route validates its `path` parameter before reading storage. Keeping\n      // the query unrestricted lets Next resize uploaded images without opening\n      // the optimizer to arbitrary local paths.\n      { pathname: "/api/media/storage" },')
replace_once("src/app/globals.css", '.step-card-top > span { color: color-mix(in srgb, var(--ink) 13%, transparent); font-size: 28px; font-weight: 850; }', '.step-card-top > span { color: color-mix(in srgb, var(--ink) 58%, var(--surface)); font-size: 28px; font-weight: 850; }')

for path in [
    "src/app/page.tsx",
    "src/components/car-showcase.tsx",
    "src/components/car-card.tsx",
    "src/components/car-gallery.tsx",
    "src/components/location-gallery.tsx",
    "src/app/booking/booking-form.tsx",
    "src/app/admin/(panel)/cars/page.tsx",
]:
    file_path, text, newline = read(path)
    marker = 'import { isStorageMediaUrl } from "@/lib/admin-media";\n'
    if text.count(marker) != 1:
        raise SystemExit(f"{path}: storage import mismatch")
    text = text.replace(marker, "", 1)
    text, count = re.subn(r" \|\| isStorageMediaUrl\([^()]*\)", "", text)
    if count < 1 or "isStorageMediaUrl" in text:
        raise SystemExit(f"{path}: storage image flag mismatch")
    write(file_path, text, newline)

print("Remaining SEO patch applied")
