import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

const rootPalette = stylesheet.match(/:root \{(?<body>[^}]*)\}/s)?.groups?.body ?? "";
const darkPalette = stylesheet.match(/:root\[data-theme="dark"\] \{(?<body>[^}]*)\}/s)?.groups?.body ?? "";

const customProperty = (palette: string, name: string) => {
  const value = palette.match(new RegExp(`${name}:\\s*(#[\\da-f]{6})`, "i"))?.[1];
  if (!value) throw new Error(`Missing ${name} in theme palette`);
  return value;
};

const relativeLuminance = (hex: string) => {
  const channels = hex.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? [];
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
};

const contrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

describe("theme contrast", () => {
  it("keeps icon glyphs opposite to an ink-colored icon background", () => {
    expect(stylesheet).toMatch(/\.service-card \.icon-box, \.icon-box \{[^}]*background: var\(--ink\); color: var\(--button-primary-ink\);/s);
  });

  it("keeps text dark inside light status tags", () => {
    expect(stylesheet).toMatch(/\.tag \{[^}]*background: #fff;[^}]*color: #080809;/s);
  });

  it("keeps the dark-theme accent readable as foreground text", () => {
    const accent = customProperty(darkPalette, "--accent");

    expect(contrastRatio(accent, customProperty(darkPalette, "--bg"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accent, customProperty(darkPalette, "--surface"))).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps white text readable on filled accent controls", () => {
    expect(contrastRatio("#ffffff", customProperty(rootPalette, "--accent-fill"))).toBeGreaterThanOrEqual(4.5);
  });
});
