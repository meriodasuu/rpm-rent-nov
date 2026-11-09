import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getAdminSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Вход в панель управления", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <div className="admin-login"><div className="surface login-card"><Logo /><span className="admin-login-kicker">RPM OPERATIONS</span><h1>Панель управления</h1><p className="muted">Войдите, чтобы управлять заявками, календарём и автопарком.</p><LoginForm /></div></div>;
}
