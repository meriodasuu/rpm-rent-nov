import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/app/admin/actions";
import { AdminNavigation } from "./admin-navigation";

export function AdminHeader({ email }: { email: string }) {
  return (
    <>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Logo />
          <span>OPERATIONS</span>
        </div>
        <AdminNavigation />
        <div className="admin-sidebar-account">
          <span title={email}>{email}</span>
          <form action={logoutAction}>
            <button type="submit">
              <LogOut aria-hidden="true" size={17} />
              Выйти
            </button>
          </form>
        </div>
      </aside>
      <header className="admin-mobile-header">
        <div className="admin-mobile-brand">
          <Logo />
          <span>OPS</span>
        </div>
        <form action={logoutAction}>
          <button type="submit" aria-label={`Выйти из аккаунта ${email}`}>
            <LogOut aria-hidden="true" size={19} />
          </button>
        </form>
      </header>
    </>
  );
}
