"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { ThemeMode } from "@/lib/theme";

const STORAGE_KEY = "rpm-theme-mode";
const THEME_EVENT = "rpm-theme-mode-change";
const modes = [{ value: "light", label: "Светлая тема", icon: Sun }, { value: "dark", label: "Тёмная тема", icon: Moon }] as const;

const applyThemeMode = (mode: Exclude<ThemeMode, "system">) => {
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = mode;
};
const subscribe = (callback: () => void) => { window.addEventListener(THEME_EVENT, callback); return () => window.removeEventListener(THEME_EVENT, callback); };
const getThemeModeSnapshot = (): ThemeMode => document.documentElement.dataset.themeMode === "dark" ? "dark" : "light";

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getThemeModeSnapshot, () => "light");
  return <div className="theme-toggle" role="group" aria-label="Цветовая тема">{modes.map(({ value, label, icon: Icon }) => <button aria-label={label} aria-pressed={mode === value} className="theme-toggle-button" key={value} onClick={() => { applyThemeMode(value); localStorage.setItem(STORAGE_KEY, value); window.dispatchEvent(new Event(THEME_EVENT)); }} title={label} type="button"><Icon aria-hidden size={15} /></button>)}</div>;
}
