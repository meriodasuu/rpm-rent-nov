const themeInitCode = `(() => {
  try {
    const stored = localStorage.getItem("rpm-theme-mode");
    const mode = stored === "light" || stored === "dark" ? stored : "light";
    document.documentElement.dataset.themeMode = mode;
    if (mode === "light" || mode === "dark") document.documentElement.dataset.theme = mode;
    else document.documentElement.removeAttribute("data-theme");
  } catch {
    document.documentElement.dataset.themeMode = "light";
    document.documentElement.dataset.theme = "light";
  }
})();`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitCode }} />;
}
