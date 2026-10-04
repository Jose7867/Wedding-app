import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Clock3, Users, RefreshCw } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  fetchConfirmationRequests,
  acceptConfirmationRequest,
  rejectConfirmationRequest,
} from "../../services/api";
import type { ConfirmationRequest } from "../../types";

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-gold/20 text-gold-dark",
  aceptada: "bg-sage/20 text-sage",
  rechazada: "bg-red-100 text-red-500",
};

export default function Confirmations() {
  const [requests, setRequests] = useState<ConfirmationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConfirmationRequests(
        filterEstado ? { estado: filterEstado } : undefined
      );
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }, [filterEstado]);

  useEffect(() => {
    load();
    // Polling cada 30 segundos para actualizar solicitudes nuevas automáticamente
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleAccept(id: string) {
    setActionLoading(id + "-accept");
    try {
      const updated = await acceptConfirmationRequest(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    setActionLoading(id + "-reject");
    try {
      const updated = await rejectConfirmationRequest(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = requests.filter((r) => r.estado === "pendiente").length;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl italic text-wine">Solicitudes de Confirmación</h1>
          <p className="mt-1 text-sm text-charcoal/60">
            Revisa y aprueba las solicitudes de asistencia enviadas por los invitados.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-wine-dark">
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex gap-2 flex-wrap">
        {["", "pendiente", "aceptada", "rechazada"].map((estado) => (
          <button
            key={estado || "all"}
            onClick={() => setFilterEstado(estado)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              filterEstado === estado
                ? "border-wine bg-wine text-ivory"
                : "border-gold/30 text-charcoal/70 hover:border-wine hover:text-wine"
            }`}
          >
            {estado === "" ? "Todas" : STATUS_LABELS[estado]}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-gold/20 bg-white">
        {loading && requests.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-charcoal/50">Cargando solicitudes...</p>
        ) : requests.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-charcoal/50">
            No hay solicitudes {filterEstado ? `con estado "${STATUS_LABELS[filterEstado]}"` : ""}.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory text-xs uppercase tracking-wider text-charcoal/50">
              <tr>
                <th className="px-5 py-3">Invitado</th>
                <th className="px-5 py-3">Acompañantes</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-t border-gold/10 align-top">
                  <td className="px-5 py-4 font-body font-semibold text-charcoal">
                    {r.nombre}
                  </td>
                  <td className="px-5 py-4">
                    {r.acompanantes.length === 0 ? (
                      <span className="text-charcoal/40 italic">Ninguno</span>
                    ) : (
                      <ul className="text-charcoal/70 space-y-0.5">
                        {r.acompanantes.map((a, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Users size={11} className="text-gold shrink-0" /> {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-wine">
                    {r.codigoVerificacion ?? <span className="text-charcoal/30">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[r.estado]}`}>
                      {r.estado === "pendiente" && <Clock3 size={11} />}
                      {r.estado === "aceptada" && <CheckCircle2 size={11} />}
                      {r.estado === "rechazada" && <XCircle size={11} />}
                      {STATUS_LABELS[r.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-charcoal/50">
                    {new Date(r.createdAt).toLocaleString("es-PE", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    {r.estado === "pendiente" ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() => handleAccept(r.id)}
                          disabled={actionLoading === r.id + "-accept"}
                          className="inline-flex items-center gap-1.5 rounded-full bg-sage/20 px-3 py-1.5 text-xs font-semibold text-sage hover:bg-sage/30 transition-colors disabled:opacity-60"
                        >
                          <CheckCircle2 size={13} />
                          {actionLoading === r.id + "-accept" ? "..." : "Aceptar"}
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          disabled={actionLoading === r.id + "-reject"}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-200 transition-colors disabled:opacity-60"
                        >
                          <XCircle size={13} />
                          {actionLoading === r.id + "-reject" ? "..." : "Rechazar"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-charcoal/40 italic">Procesada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
