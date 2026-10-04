import { useEffect, useState } from "react";
import { Users, Mail, CheckCircle2, UserCheck, Clock3 } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import { fetchDashboardStatistics } from "../../services/api";
import type { DashboardStatistics } from "../../types";

const cardConfig = [
  { key: "invitaciones", label: "Total de invitaciones", icon: Mail },
  { key: "invitados", label: "Total de invitados", icon: Users },
  { key: "confirmados", label: "Invitaciones confirmadas", icon: CheckCircle2 },
  { key: "presentes", label: "Invitados presentes", icon: UserCheck },
  { key: "pendientes", label: "Invitaciones pendientes", icon: Clock3 },
  { key: "pendientesDeLlegada", label: "Invitados por llegar", icon: Clock3 },
] as const;

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStatistics()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl italic text-wine">Resumen</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Vista general del estado de las invitaciones para la boda de Emma &amp; José.
      </p>

      {loading ? (
        <p className="mt-8 text-sm text-charcoal/50">Cargando estadísticas...</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cardConfig.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-gold/20 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-charcoal/50">{label}</p>
                <Icon className="text-gold" size={20} />
              </div>
              <p className="mt-3 font-display text-4xl text-wine">
                {stats ? stats[key] : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
