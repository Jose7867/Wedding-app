import { PropsWithChildren, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ScanLine, LogOut, Menu, X, ClipboardList } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { fetchPendingConfirmationsCount } from "../services/api";

export default function AdminLayout({ children }: PropsWithChildren) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Polling del badge de solicitudes pendientes cada 30 segundos
  useEffect(() => {
    async function load() {
      try {
        const count = await fetchPendingConfirmationsCount();
        setPendingCount(count);
      } catch {
        // silencioso si falla
      }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  const links = [
    { to: "/admin/dashboard", label: "Resumen", icon: LayoutDashboard, badge: 0 },
    { to: "/admin/confirmaciones", label: "Confirmaciones", icon: ClipboardList, badge: pendingCount },
    { to: "/admin/invitados", label: "Invitados", icon: Users, badge: 0 },
    { to: "/admin/asistencia", label: "Registro de asistencia", icon: ScanLine, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-ivory md:flex">
      <button
        className="fixed left-4 top-4 z-40 rounded-full bg-wine p-2 text-ivory md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir menú"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-wine px-6 py-8 text-ivory transition-transform md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p className="font-script text-3xl text-gold-light">E &amp; J</p>
        <p className="mt-1 text-xs uppercase tracking-widest text-ivory/60">Panel administrativo</p>

        <nav className="mt-10 flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  isActive ? "bg-ivory/10 text-gold-light" : "text-ivory/80 hover:bg-ivory/5"
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-xs font-bold text-wine-dark">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-10 border-t border-ivory/10 pt-6">
          <p className="text-xs text-ivory/50">Sesión</p>
          <p className="mt-1 text-sm">{admin?.nombre ?? "Administrador"}</p>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-sm text-gold-light hover:text-ivory"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 px-6 py-10 md:px-10">{children}</main>
    </div>
  );
}
