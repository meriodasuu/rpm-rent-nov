export type ThemeMode = "system" | "light" | "dark";

export type ResolvedTheme = Exclude<ThemeMode, "system">;

export const resolveTheme = (mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme =>
  mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;
