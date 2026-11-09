import { AdminHeader } from "@/components/admin/admin-header";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: { default: "Панель управления", template: "%s | RPM Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <div className="admin-shell"><AdminHeader email={session.email} /><main className="admin-main">{children}</main></div>;
}
