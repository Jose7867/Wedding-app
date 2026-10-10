import { useEffect, useState } from "react";
import { Search, Plus, Trash2, X, Download } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  fetchInvitations,
  createInvitation,
  deleteInvitation,
  fetchInvitationById,
  addGuestToInvitation,
  deleteGuest,
} from "../../services/api";
import type { Invitation, InvitationSummary } from "../../types";

const estadoStyles: Record<string, string> = {
  pendiente: "bg-gold/15 text-gold",
  confirmada: "bg-sage/20 text-sage",
  presente: "bg-wine/10 text-wine",
};

export default function Guests() {
  const [invitations, setInvitations] = useState<InvitationSummary[]>([]);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Invitation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [downloadingList, setDownloadingList] = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetchInvitations({ search: search || undefined, estado: estado || undefined });
    setInvitations(data);
    setLoading(false);
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, estado]);

  async function openDetail(id: string) {
    const invitation = await fetchInvitationById(id);
    setSelected(invitation);
  }

  async function downloadGuestList() {
    try {
      setDownloadingList(true);
      
  
      const invitations = await fetchInvitations();
  
      const details = await Promise.all(
        invitations.map((invitation) =>
          fetchInvitationById(invitation.id)
        )
      );
  
      const rows = details.flatMap((invitation) =>
        invitation.guests.map((guest) => ({
          codigo: invitation.codigo,
          invitadoPrincipal: invitation.nombrePrincipal,
          nombre: guest.nombre,
          tipo: guest.tipo,
          estado: guest.presente ? "Presente" : "Pendiente",
          horaIngreso: guest.horaIngreso
            ? new Date(guest.horaIngreso).toLocaleString("es-PE")
            : "",
        }))
      );
  
      if (rows.length === 0) {
        alert("No hay invitados para descargar.");
        return;
      }
  
      const headers = [
        "Código",
        "Invitado principal",
        "Nombre",
        "Tipo",
        "Estado",
        "Hora de ingreso",
      ];
  
      const csvCell = (value: unknown) => {
        const text = value == null ? "" : String(value);
        return `"${text.replace(/"/g, '""')}"`;
      };
  
      const csv = [
        headers.map(csvCell).join(","),
        ...rows.map((row) =>
          [
            row.codigo,
            row.invitadoPrincipal,
            row.nombre,
            row.tipo,
            row.estado,
            row.horaIngreso,
          ]
            .map(csvCell)
            .join(",")
        ),
      ].join("\n");
  
      // BOM para que Excel reconozca correctamente tildes y ñ.
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
  
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
  
      link.href = url;
      link.download = "lista-invitados-boda.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo generar la lista de invitados.");
    } finally {
      setDownloadingList(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta invitación y a todos sus invitados?")) return;
    await deleteInvitation(id);
    load();
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl italic text-wine">Invitados</h1>
          <p className="mt-1 text-sm text-charcoal/60">Gestiona invitaciones, códigos y acompañantes.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadGuestList}
            disabled={downloadingList}
            className="flex items-center justify-center gap-2 rounded-lg border border-gold/30 bg-white px-4 py-2 text-sm font-semibold text-wine transition hover:bg-gold/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} />
            {downloadingList ? "GENERANDO LISTA..." : "DESCARGAR LISTA DE INVITADOS"}
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Nueva invitación
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full rounded-lg border border-gold/30 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="rounded-lg border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="presente">Presente</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gold/20 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-xs uppercase tracking-wider text-charcoal/50">
            <tr>
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Invitado</th>
              <th className="px-5 py-3">Acompañantes</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-charcoal/50">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && invitations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-charcoal/50">
                  No se encontraron invitaciones.
                </td>
              </tr>
            )}
            {invitations.map((inv) => (
              <tr key={inv.id} className="border-t border-gold/10">
                <td className="px-5 py-3 font-mono text-xs">{inv.codigo}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => openDetail(inv.id)}
                    className="text-wine underline decoration-gold/50 underline-offset-2"
                  >
                    {inv.nombrePrincipal}
                  </button>
                </td>
                <td className="px-5 py-3">{inv.acompanantes}</td>
                <td className="px-5 py-3">{inv.totalInvitados}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs capitalize ${estadoStyles[inv.estado]}`}>
                    {inv.estado}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="text-charcoal/40 hover:text-wine"
                    aria-label="Eliminar invitación"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <InvitationDetailModal
          invitation={selected}
          onClose={() => setSelected(null)}
          onChanged={async () => {
            const refreshed = await fetchInvitationById(selected.id);
            setSelected(refreshed);
            load();
          }}
        />
      )}

      {showCreate && (
        <CreateInvitationModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}

function InvitationDetailModal({
  invitation,
  onClose,
  onChanged,
}: {
  invitation: Invitation;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [nuevoAcompanante, setNuevoAcompanante] = useState("");

  async function handleAdd() {
    if (!nuevoAcompanante.trim()) return;
    await addGuestToInvitation(invitation.id, nuevoAcompanante.trim());
    setNuevoAcompanante("");
    onChanged();
  }

  async function handleRemove(guestId: string) {
    await deleteGuest(guestId);
    onChanged();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-ivory p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-charcoal/50">{invitation.codigo}</p>
            <h2 className="font-display text-2xl italic text-wine">{invitation.nombrePrincipal}</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <ul className="mt-6 divide-y divide-gold/10">
          {invitation.guests.map((g) => (
            <li key={g.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {g.nombre}{" "}
                <span className="text-xs uppercase text-charcoal/40">
                  {g.tipo === "principal" ? "(principal)" : ""}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className={g.presente ? "text-sage" : "text-charcoal/40"}>
                  {g.presente ? "✓ Presente" : "Pendiente"}
                </span>
                {g.tipo === "acompanante" && (
                  <button onClick={() => handleRemove(g.id)} className="text-charcoal/40 hover:text-wine">
                    <Trash2 size={14} />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex gap-2">
          <input
            value={nuevoAcompanante}
            onChange={(e) => setNuevoAcompanante(e.target.value)}
            placeholder="Agregar acompañante"
            className="flex-1 rounded-lg border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button onClick={handleAdd} className="btn-outline px-4 py-2 text-xs">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateInvitationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nombrePrincipal, setNombrePrincipal] = useState("");
  const [codigo, setCodigo] = useState("");
  const [acompanantesText, setAcompanantesText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombrePrincipal.trim()) return;
    setSaving(true);
    try {
      await createInvitation({
        nombrePrincipal: nombrePrincipal.trim(),
        codigo: codigo.trim() || undefined,
        acompanantes: acompanantesText
          .split("\n")
          .map((n) => n.trim())
          .filter(Boolean),
      });
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-ivory p-8">
        <div className="flex items-start justify-between">
          <h2 className="font-display text-2xl italic text-wine">Nueva invitación</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-charcoal/60">
              Invitado principal
            </label>
            <input
              required
              value={nombrePrincipal}
              onChange={(e) => setNombrePrincipal(e.target.value)}
              className="w-full rounded-lg border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-charcoal/60">
              Código (opcional — se genera automáticamente)
            </label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="BODA-JOSE-002"
              className="w-full rounded-lg border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-charcoal/60">
              Acompañantes (uno por línea)
            </label>
            <textarea
              value={acompanantesText}
              onChange={(e) => setAcompanantesText(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary justify-center">
            {saving ? "Guardando..." : "Crear invitación"}
          </button>
        </div>
      </form>
    </div>
  );
}
