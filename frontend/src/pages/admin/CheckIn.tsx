import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, ScanLine, Search } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  fetchAttendanceHistory,
  fetchInvitations,
  fetchInvitationById,
  markAllPresent,
  markGuestPresent,
  fetchConfirmationRequests,
} from "../../services/api";
import type { AttendanceRecordRow, Invitation } from "../../types";

export default function CheckIn() {
  const [codigo, setCodigo] = useState("");
  const [found, setFound] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AttendanceRecordRow[]>([]);

  async function loadHistory() {
    const data = await fetchAttendanceHistory();
    setHistory(data);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    setLoading(true);
    setError(null);
    setConfirmation(null);
    setFound(null);
    try {
      const searchTerm = codigo.trim().toUpperCase();

      // Buscar en invitaciones (código original o código de verificación de invitación)
      const invResults = await fetchInvitations({ search: searchTerm });
      const exactInv = invResults.find(
        (r) =>
          r.codigo.toUpperCase() === searchTerm ||
          r.codigoVerificacion?.toUpperCase() === searchTerm
      );

      if (exactInv) {
        const detail = await fetchInvitationById(exactInv.id);
        setFound(detail);
        return;
      }

      // Buscar en solicitudes de confirmación por código de verificación
      const confResults = await fetchConfirmationRequests({ estado: "aceptada" });
      const exactConf = confResults.find(
        (r) => r.codigoVerificacion?.toUpperCase() === searchTerm
      );

      if (exactConf) {
        // Buscar en invitaciones por nombre del solicitante como fallback de identificación
        const byName = await fetchInvitations({ search: exactConf.nombre });
        if (byName.length > 0) {
          const detail = await fetchInvitationById(byName[0].id);
          setFound(detail);
          return;
        }
      }

      setError("CÓDIGO NO ENCONTRADO. Verifica el código o pide al invitado que muestre su QR.");
    } finally {
      setLoading(false);
    }
  }


  async function handleMarkGuest(guestId: string) {
    await markGuestPresent(guestId);
    if (found) {
      const refreshed = await fetchInvitationById(found.id);
      setFound(refreshed);
    }
  }

  async function handleMarkAll() {
    if (!found) return;
    const res = await markAllPresent(found.id);
    setConfirmation(
      `✓ Asistencia registrada correctamente. ${found.nombrePrincipal} y su grupo están presentes.`
    );
    const refreshed = await fetchInvitationById(found.id);
    setFound(refreshed);
    loadHistory();
    void res;
  }

  function resetForNext() {
    setCodigo("");
    setFound(null);
    setError(null);
    setConfirmation(null);
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl italic text-wine">Registro de asistencia</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Ingresa el código de invitación para verificar y marcar la llegada de los invitados.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex max-w-lg gap-2">
        <div className="relative flex-1">
          <ScanLine
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
            size={18}
          />
          <input
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="BODA-JOSE-001"
            className="w-full rounded-lg border border-gold/30 py-3 pl-10 pr-3 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          <Search size={16} /> Verificar
        </button>
      </form>

      {error && (
        <p className="mt-6 max-w-lg rounded-xl bg-wine/10 px-5 py-4 font-body text-sm font-semibold text-wine">
          {error}
        </p>
      )}

      {found && (
        <div className="mt-8 max-w-lg rounded-2xl border border-gold/20 bg-white p-8">
          <p className="text-xs uppercase tracking-widest text-charcoal/50">Invitación encontrada</p>
          <h2 className="mt-1 font-display text-2xl italic text-wine">{found.nombrePrincipal}</h2>

          <ul className="mt-5 divide-y divide-gold/10">
            {found.guests.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`guest-${g.id}`}
                    checked={g.presente}
                    disabled={g.presente}
                    onChange={() => !g.presente && handleMarkGuest(g.id)}
                    className="h-5 w-5 rounded border-gold/30 text-wine focus:ring-gold cursor-pointer disabled:cursor-default"
                  />
                  <label
                    htmlFor={`guest-${g.id}`}
                    className={`font-body text-sm cursor-pointer ${g.presente ? "text-charcoal/50 line-through" : "text-charcoal"}`}
                  >
                    {g.nombre}
                  </label>
                </div>
                <span className="text-xxs font-semibold uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5 rounded">
                  {g.tipo === "principal" ? "Principal" : "Acomp."}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm font-semibold text-charcoal">
            Total: {found.guests.length} persona(s) · Estado:{" "}
            <span className="capitalize">{found.estado}</span>
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button onClick={handleMarkAll} className="btn-primary justify-center py-4 text-base">
              MARCAR COMO PRESENTES
            </button>
            <button onClick={resetForNext} className="btn-outline justify-center">
              Listo — siguiente invitado
            </button>
          </div>

          {confirmation && (
            <p className="mt-5 rounded-xl bg-sage/10 px-5 py-4 text-center text-sm font-semibold text-sage">
              {confirmation}
            </p>
          )}
        </div>
      )}

      <div className="mt-12">
        <h3 className="font-display text-xl italic text-wine">Historial de asistencia</h3>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gold/20 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory text-xs uppercase tracking-wider text-charcoal/50">
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Ingreso</th>
                <th className="px-5 py-3">Registrado por</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-charcoal/50">
                    Aún no se ha registrado ninguna asistencia.
                  </td>
                </tr>
              )}
              {history.map((r) => (
                <tr key={r.id} className="border-t border-gold/10">
                  <td className="px-5 py-3">{r.nombre}</td>
                  <td className="px-5 py-3 font-mono text-xs">{r.codigo}</td>
                  <td className="px-5 py-3">{new Date(r.horaIngreso).toLocaleTimeString("es-PE")}</td>
                  <td className="px-5 py-3">{r.registradoPor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
