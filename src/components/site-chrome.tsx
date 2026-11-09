"use client";

import { usePathname } from "next/navigation";
import { isAdminPath } from "@/lib/navigation";

export function SiteChrome({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();

  if (isAdminPath(pathname)) return <>{children}</>;

  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
    </>
  );
}
