export const isNavigationActive = (pathname: string, href: string): boolean => {
  if (href === "/" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
};

export const isAdminPath = (pathname: string): boolean =>
  pathname === "/admin" || pathname.startsWith("/admin/");

export const closeNavigationMenu = (menu: { open: boolean } | null): void => {
  if (menu) menu.open = false;
};
