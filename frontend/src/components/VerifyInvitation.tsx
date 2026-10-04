import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Trash2, Send, Search, CheckCircle, Clock, XCircle, Mail, RotateCcw } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { submitConfirmationRequest, searchConfirmationByName } from "../services/api";
import type { ConfirmationRequest } from "../types";

type View = "tabs" | "sent" | "results";

export default function VerifyInvitation() {
  const [activeTab, setActiveTab] = useState<"register" | "check">("register");
  const [view, setView] = useState<View>("tabs");

  // --- Formulario de registro ---
  const [nombre, setNombre] = useState("");
  const [companions, setCompanions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // --- Búsqueda de estado ---
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ConfirmationRequest[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  function addCompanion() {
    setCompanions((prev) => [...prev, ""]);
  }

  function removeCompanion(idx: number) {
    setCompanions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateCompanion(idx: number, value: string) {
    setCompanions((prev) => prev.map((c, i) => (i === idx ? value : c)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    const emptyCompanion = companions.some((c) => !c.trim());
    if (emptyCompanion) {
      setSubmitError("Completa el nombre de todos los acompañantes antes de enviar.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitConfirmationRequest(
        nombre.trim(),
        companions.map((c) => c.trim()).filter(Boolean)
      );
      setView("sent");
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.error ?? "Ocurrió un error. Por favor intenta de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (searchName.trim().length < 2) {
      setSearchError("Ingresa al menos 2 caracteres para buscar.");
      return;
    }
    setSearching(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const data = await searchConfirmationByName(searchName.trim());
      if (data.length === 0) {
        setSearchError("No encontramos ninguna solicitud con ese nombre. Verifica que lo hayas escrito correctamente.");
      } else {
        setSearchResults(data);
        setView("results");
      }
    } catch (err: any) {
      setSearchError(
        err?.response?.data?.error ?? "Ocurrió un error al buscar. Intenta de nuevo."
      );
    } finally {
      setSearching(false);
    }
  }

  function resetAll() {
    setView("tabs");
    setActiveTab("register");
    setNombre("");
    setCompanions([]);
    setSubmitError(null);
    setSearchName("");
    setSearchResults([]);
    setSearchError(null);
  }

  const statusIcon = (estado: string) => {
    if (estado === "aceptada") return <CheckCircle className="text-sage" size={20} />;
    if (estado === "rechazada") return <XCircle className="text-red-400" size={20} />;
    return <Clock className="text-gold" size={20} />;
  };

  const statusLabel = (estado: string) => {
    if (estado === "aceptada") return "Aceptada";
    if (estado === "rechazada") return "Rechazada";
    return "Pendiente de aprobación";
  };

  return (
    <section id="confirmar" className="bg-wine px-6 py-24">
      <div className="mx-auto max-w-xl">
        <SectionHeading eyebrow="Antes de llegar" title="Confirma tu asistencia" light />

        <AnimatePresence mode="wait">

          {/* ── Vista: mensaje de confirmación enviado ── */}
          {view === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 rounded-2xl bg-ivory p-8 text-center"
            >
              <Heart className="mx-auto mb-4 text-gold" size={40} fill="currentColor" />
              <p className="font-display text-3xl italic text-wine">¡Gracias!</p>
              <p className="mt-3 font-body text-sm leading-relaxed text-charcoal/80">
                Tu solicitud fue recibida. <strong>En breve recibirás tu código de identificación</strong> una vez que el equipo la valide.
              </p>
              <p className="mt-4 font-body text-xs italic text-charcoal/60">
                Puedes volver aquí y consultar el estado de tu solicitud con tu nombre en la pestaña <strong>"Consultar código"</strong>.
              </p>
              <button
                onClick={resetAll}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2 font-body text-xs text-wine hover:bg-gold/10 transition-colors"
              >
                <RotateCcw size={13} /> Volver al inicio
              </button>
            </motion.div>
          )}

          {/* ── Vista: resultados de búsqueda ── */}
          {view === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 space-y-4"
            >
              {searchResults.map((req) => (
                <div key={req.id} className="rounded-2xl bg-ivory p-6">
                  <div className="flex items-start gap-3">
                    {statusIcon(req.estado)}
                    <div className="flex-1">
                      <p className="font-display text-xl italic text-wine">{req.nombre}</p>
                      <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${
                        req.estado === "aceptada" ? "text-sage" :
                        req.estado === "rechazada" ? "text-red-400" : "text-gold"
                      }`}>
                        {statusLabel(req.estado)}
                      </p>
                    </div>
                  </div>

                  {req.acompanantes.length > 0 && (
                    <div className="mt-3 rounded-lg bg-charcoal/5 p-3">
                      <p className="text-xxs font-semibold uppercase tracking-wider text-charcoal/50 mb-1">Acompañantes</p>
                      <ul className="font-body text-sm text-charcoal/80 space-y-0.5">
                        {req.acompanantes.map((a, i) => <li key={i}>• {a}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Código y QR si fue aceptada */}
                  {req.estado === "aceptada" && req.codigoVerificacion && (
                    <>
                      <div className="mt-5 flex flex-col items-center rounded-xl border border-gold/20 bg-white p-5">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${req.codigoVerificacion}`}
                          alt="Código QR de acceso"
                          className="h-40 w-40 rounded-lg"
                          loading="lazy"
                        />
                        <p className="mt-3 font-mono text-xl font-bold tracking-widest text-wine">
                          {req.codigoVerificacion}
                        </p>
                        <p className="mt-1 text-xxs uppercase tracking-wider text-charcoal/40">
                          Código de acceso — Preséntalo el día del evento
                        </p>
                      </div>

                      {/* Lluvia de sobres */}
                      <div className="mt-4 rounded-lg border border-gold/30 bg-gold/10 p-4 flex gap-3">
                        <Mail className="text-wine shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-display text-base italic text-wine font-semibold">
                            Lluvia de sobres ✉️
                          </p>
                          <p className="mt-1 font-body text-xs leading-relaxed text-charcoal/80">
                            Tu presencia es nuestro mejor regalo. Si deseas tener un detalle con nosotros, 
                            nuestro evento contará con <strong>lluvia de sobres</strong>: un obsequio en efectivo 
                            que podrás depositar en el cofre dispuesto en la recepción. ¡Muchas gracias por tu cariño!
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {req.estado === "rechazada" && (
                    <p className="mt-3 font-body text-xs italic text-red-400/80">
                      Tu solicitud no pudo ser procesada. Comunícate con los organizadores para más información.
                    </p>
                  )}

                  {req.estado === "pendiente" && (
                    <p className="mt-3 font-body text-xs italic text-charcoal/60">
                      Tu solicitud está siendo revisada. Vuelve pronto para ver tu código de acceso.
                    </p>
                  )}
                </div>
              ))}

              <button
                onClick={resetAll}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 px-5 py-2 font-body text-xs text-ivory/80 hover:text-ivory transition-colors"
              >
                <RotateCcw size={13} /> Volver al inicio
              </button>
            </motion.div>
          )}

          {/* ── Vista: pestañas principales ── */}
          {view === "tabs" && (
            <motion.div
              key="tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              {/* Selector de pestaña */}
              <div className="flex rounded-full bg-ivory/10 p-1">
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 rounded-full py-2 text-sm font-body transition-colors ${
                    activeTab === "register"
                      ? "bg-gold text-wine-dark font-semibold"
                      : "text-ivory/70 hover:text-ivory"
                  }`}
                >
                  Confirmar asistencia
                </button>
                <button
                  onClick={() => setActiveTab("check")}
                  className={`flex-1 rounded-full py-2 text-sm font-body transition-colors ${
                    activeTab === "check"
                      ? "bg-gold text-wine-dark font-semibold"
                      : "text-ivory/70 hover:text-ivory"
                  }`}
                >
                  Consultar código
                </button>
              </div>

              {/* Pestaña: Registrar solicitud */}
              {activeTab === "register" && (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="mt-6 rounded-2xl bg-ivory p-7"
                >
                  <p className="font-body text-sm text-charcoal/70 mb-5">
                    Ingresa tu nombre completo y el de tus acompañantes para registrar tu asistencia. El equipo validará tu solicitud en breve.
                  </p>

                  <div className="flex flex-col gap-1 mb-4">
                    <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                      Tu nombre y apellido *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: María García López"
                      className="rounded-lg border border-gold/30 bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
                      required
                    />
                  </div>

                  {companions.map((c, idx) => (
                    <div key={idx} className="flex items-end gap-2 mb-3">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                          Acompañante {idx + 1}
                        </label>
                        <input
                          type="text"
                          value={c}
                          onChange={(e) => updateCompanion(idx, e.target.value)}
                          placeholder="Nombre y apellido"
                          className="rounded-lg border border-gold/30 bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCompanion(idx)}
                        className="mb-0.5 rounded-lg p-2 text-charcoal/40 hover:text-wine hover:bg-wine/10 transition-colors"
                        aria-label="Eliminar acompañante"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addCompanion}
                    className="mt-1 mb-5 flex items-center gap-2 font-body text-xs text-wine hover:text-wine-dark transition-colors"
                  >
                    <Plus size={14} /> Agregar acompañante
                  </button>

                  {submitError && (
                    <p className="mb-4 rounded-lg bg-wine/10 px-4 py-2 font-body text-xs text-wine">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !nombre.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-wine px-6 py-3 font-body text-sm font-semibold text-ivory transition-colors hover:bg-wine-dark disabled:opacity-60"
                  >
                    <Send size={15} />
                    {submitting ? "Enviando..." : "Registrar solicitud"}
                  </button>
                </motion.form>
              )}

              {/* Pestaña: Consultar estado */}
              {activeTab === "check" && (
                <motion.div
                  key="check-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl bg-ivory p-7"
                >
                  <p className="font-body text-sm text-charcoal/70 mb-5">
                    ¿Ya enviaste tu solicitud? Ingresa tu nombre para ver el estado y obtener tu código de acceso una vez aprobada.
                  </p>

                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="Busca por tu nombre"
                      className="flex-1 rounded-lg border border-gold/30 bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                    <button
                      type="submit"
                      disabled={searching}
                      className="inline-flex items-center gap-2 rounded-full bg-wine px-5 py-2.5 font-body text-sm font-semibold text-ivory transition-colors hover:bg-wine-dark disabled:opacity-60"
                    >
                      <Search size={15} />
                      {searching ? "..." : "Buscar"}
                    </button>
                  </form>

                  {searchError && (
                    <p className="mt-4 font-body text-xs text-wine/80">{searchError}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
