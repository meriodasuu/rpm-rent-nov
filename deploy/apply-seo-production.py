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


tick = chr(96)
old_robots = 'return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }, sitemap: ' + tick + '${siteUrl}/sitemap.xml' + tick + ', host: siteUrl };'
new_robots = 'return { rules: { userAgent: "*", allow: ["/", "/api/media/yandex", "/api/media/storage"], disallow: ["/admin", "/api/"] }, sitemap: ' + tick + '${siteUrl}/sitemap.xml' + tick + ', host: siteUrl };'
replace_once("src/app/robots.ts", old_robots, new_robots)

old_title = 'title: location.seoTitle || ' + tick + '${location.title} | RPM Rent' + tick + ','
replace_once("src/app/locations/[slug]/page.tsx", old_title, 'title: (location.seoTitle || location.title).replace(/\\s*\\|\\s*RPM Rent\\s*$/i, ""),')

for path, old, new in [
    ("src/app/cookies/page.tsx", 'export const metadata: Metadata = { title: "Политика использования cookie-файлов",', 'export const metadata: Metadata = { title: "Политика использования cookie-файлов", description: "Как RPM Rent использует cookie и локальные настройки сайта.",'),
    ("src/app/privacy/page.tsx", 'export const metadata: Metadata = { title: "Политика конфиденциальности",', 'export const metadata: Metadata = { title: "Политика конфиденциальности", description: "Политика конфиденциальности RPM Rent: какие данные обрабатываются для заявок на аренду автомобиля.",'),
    ("src/app/personal-data-policy/page.tsx", 'export const metadata: Metadata = { title: "Политика обработки персональных данных",', 'export const metadata: Metadata = { title: "Политика обработки персональных данных", description: "Политика обработки персональных данных ООО «РПМ ГРУПП» для пользователей сайта RPM Rent.",'),
    ("src/app/data-processing/page.tsx", 'export const metadata: Metadata = { title: "Правила обработки данных",', 'export const metadata: Metadata = { title: "Правила обработки данных", description: "Правила обработки данных пользователей сайта RPM Rent при обращении по аренде автомобиля.",'),
]:
    replace_once(path, old, new)

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

print("SEO patch applied to 15 files")
