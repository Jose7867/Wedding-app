import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, Camera, ScanLine, Search, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
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

const QR_READER_ID = "wedding-checkin-qr-reader";

export default function CheckIn() {
  const [codigo, setCodigo] = useState("");
  const [found, setFound] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AttendanceRecordRow[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanningRef = useRef(false);

  async function loadHistory() {
    try {
      const data = await fetchAttendanceHistory();
      setHistory(data);
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  /**
   * Busca una invitación utilizando:
   * - código de invitación
   * - código de verificación
   * - código de verificación de una solicitud aceptada
   */
  async function searchInvitation(searchTerm: string) {
    const normalizedCode = searchTerm.trim().toUpperCase();

    if (!normalizedCode) return;

    setLoading(true);
    setError(null);
    setConfirmation(null);
    setFound(null);

    try {
      // 1. Buscar directamente en invitaciones.
      const invResults = await fetchInvitations({
        search: normalizedCode,
      });

      const exactInv = invResults.find(
        (invitation) =>
          invitation.codigo.toUpperCase() === normalizedCode ||
          invitation.codigoVerificacion?.toUpperCase() === normalizedCode
      );

      if (exactInv) {
        const detail = await fetchInvitationById(exactInv.id);
        setFound(detail);
        return;
      }

      // 2. Buscar en solicitudes de confirmación aceptadas.
      const confResults = await fetchConfirmationRequests({
        estado: "aceptada",
      });

      const exactConf = confResults.find(
        (confirmationRequest) =>
          confirmationRequest.codigoVerificacion?.toUpperCase() ===
          normalizedCode
      );

      if (exactConf) {
        // Buscar la invitación creada para esa persona.
        const byName = await fetchInvitations({
          search: exactConf.nombre,
        });

        if (byName.length > 0) {
          const detail = await fetchInvitationById(byName[0].id);
          setFound(detail);
          return;
        }
      }

      setError(
        "CÓDIGO NO ENCONTRADO. Verifica el código o pide al invitado que muestre su QR."
      );
    } catch {
      setError(
        "No se pudo consultar la invitación. Verifica tu conexión e inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();

    if (!codigo.trim()) {
      setError("Ingresa un código de invitación.");
      return;
    }

    await searchInvitation(codigo);
  }

  /**
   * Detiene completamente el lector QR.
   */
  async function stopScanner() {
    const scanner = scannerRef.current;

    scanningRef.current = false;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // El lector puede ya estar detenido.
      }

      try {
        scanner.clear();
      } catch {
        // El elemento puede ya haber sido limpiado.
      }
    }

    scannerRef.current = null;
    setScannerLoading(false);
  }

  /**
   * Abre la cámara del teléfono y comienza a leer códigos QR.
   */
  async function startScanner() {
    setError(null);
    setScannerError(null);
    setConfirmation(null);
    setScannerOpen(true);
    setScannerLoading(true);

    // Esperamos a que React renderice el contenedor del lector.
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 100);
    });

    try {
      const scanner = new Html5Qrcode(QR_READER_ID);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        throw new Error("No se encontró ninguna cámara.");
      }

      // Intentamos seleccionar la cámara trasera.
      const backCamera =
        cameras.find((camera) => {
          const label = camera.label.toLowerCase();

          return (
            label.includes("back") ||
            label.includes("rear") ||
            label.includes("trasera") ||
            label.includes("environment")
          );
        }) ?? cameras[cameras.length - 1];

      scanningRef.current = true;

      await scanner.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (!scanningRef.current) return;

          // Evita múltiples lecturas del mismo QR.
          scanningRef.current = false;

          // Vibración breve cuando el QR es detectado.
          if ("vibrate" in navigator) {
            try {
              navigator.vibrate(150);
            } catch {
              // Algunos navegadores no permiten vibración.
            }
          }

          await stopScanner();
          setScannerOpen(false);

          const scannedCode = decodedText.trim();

          setCodigo(scannedCode);

          // Buscar automáticamente la invitación.
          await searchInvitation(scannedCode);
        },
        () => {
          // Los errores de lectura son normales mientras se busca el QR.
          // No mostramos estos errores continuamente al usuario.
        }
      );

      setScannerLoading(false);
    } catch (err) {
      await stopScanner();

      setScannerOpen(false);

      const message =
        err instanceof Error ? err.message : "No se pudo abrir la cámara.";

      if (
        message.toLowerCase().includes("permission") ||
        message.toLowerCase().includes("notallowed")
      ) {
        setScannerError(
          "Permiso de cámara denegado. Permite el acceso a la cámara desde la configuración del navegador."
        );
      } else {
        setScannerError(
          "No se pudo abrir la cámara. Comprueba que el dispositivo tenga una cámara disponible y que el sitio use HTTPS."
        );
      }
    }
  }

  async function closeScanner() {
    await stopScanner();
    setScannerOpen(false);
    setScannerError(null);
  }

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  async function handleMarkGuest(guestId: string) {
    try {
      await markGuestPresent(guestId);

      if (found) {
        const refreshed = await fetchInvitationById(found.id);
        setFound(refreshed);
      }

      await loadHistory();
    } catch {
      setError("No se pudo registrar la asistencia.");
    }
  }

  async function handleMarkAll() {
    if (!found) return;

    try {
      const res = await markAllPresent(found.id);

      setConfirmation(
        `✓ Asistencia registrada correctamente. ${found.nombrePrincipal} y su grupo están presentes.`
      );

      const refreshed = await fetchInvitationById(found.id);

      setFound(refreshed);

      await loadHistory();

      void res;
    } catch {
      setError("No se pudo registrar la asistencia.");
    }
  }





  function resetForNext() {
    setCodigo("");
    setFound(null);
    setError(null);
    setConfirmation(null);
    setScannerError(null);
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl italic text-wine">
        Registro de asistencia
      </h1>

      <p className="mt-1 text-sm text-charcoal/60">
        Escanea el QR de la invitación o ingresa el código manualmente para
        verificar y registrar la llegada de los invitados.
      </p>

      {/* ========================= */}
      {/* ESCÁNER QR */}
      {/* ========================= */}

      {scannerOpen && (
        <div className="mt-6 max-w-lg overflow-hidden rounded-2xl border border-gold/20 bg-black shadow-lg">
          <div className="flex items-center justify-between bg-wine px-5 py-4 text-white">
            <div>
              <p className="font-semibold">Escanear invitación</p>
              <p className="text-xs text-white/70">
                Apunta la cámara al código QR
              </p>
            </div>

            <button
              type="button"
              onClick={closeScanner}
              className="rounded-full p-2 transition hover:bg-white/10"
              aria-label="Cerrar escáner"
            >
              <X size={22} />
            </button>

          </div>

          <div className="relative bg-black p-4">
            <div
              id={QR_READER_ID}
              className="min-h-[300px] w-full overflow-hidden rounded-xl"
            />

            {scannerLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <Camera
                    size={42}
                    className="mx-auto mb-3 animate-pulse"
                  />
                  <p className="text-sm font-semibold">
                    Activando cámara...
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Permite el acceso a la cámara si el navegador lo solicita.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-black px-5 pb-5 text-center text-xs text-white/60">
            Coloca el código QR dentro del recuadro.
          </div>
        </div>
      )}

      {scannerError && (
        <div className="mt-5 max-w-lg rounded-xl bg-wine/10 px-5 py-4 text-sm font-semibold text-wine">
          {scannerError}
        </div>
      )}

      {/* ========================= */}
      {/* BÚSQUEDA MANUAL */}
      {/* ========================= */}

      <div className="mt-6 max-w-lg">
        <button
          type="button"
          onClick={startScanner}
          disabled={loading || scannerOpen}
          className="btn-primary flex w-full items-center justify-center gap-2 py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ScanLine size={20} />
          {scannerOpen ? "ESCÁNER ACTIVO" : "ESCANEAR QR"}
        </button>


        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gold/20" />
          <span className="text-xs uppercase tracking-widest text-charcoal/40">
            o ingresar manualmente
          </span>
          <div className="h-px flex-1 bg-gold/20" />
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
              size={18}
            />

            <input
              autoFocus={!scannerOpen}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="BODA-JOSE-001"
              className="w-full rounded-lg border border-gold/30 py-3 pl-10 pr-3 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || scannerOpen}
            className="btn-primary"
          >
            <Search size={16} />
            {loading ? "Buscando..." : "Verificar"}
          </button>
        </form>
      </div>

      {/* ========================= */}
      {/* ERROR */}
      {/* ========================= */}

      {error && (
        <p className="mt-6 max-w-lg rounded-xl bg-wine/10 px-5 py-4 font-body text-sm font-semibold text-wine">
          {error}
        </p>
      )}

      {/* ========================= */}
      {/* INVITACIÓN ENCONTRADA */}
      {/* ========================= */}

      {found && (
        <div className="mt-8 max-w-lg rounded-2xl border border-gold/20 bg-white p-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-sage" size={24} />

            <p className="text-xs uppercase tracking-widest text-charcoal/50">
              Invitación encontrada
            </p>
          </div>

          <h2 className="mt-2 font-display text-2xl italic text-wine">
            {found.nombrePrincipal}
          </h2>

          <p className="mt-1 font-mono text-xs text-charcoal/50">
            Código: {found.codigo}
          </p>

          <ul className="mt-5 divide-y divide-gold/10">
            {found.guests.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`guest-${g.id}`}
                    checked={g.presente}
                    disabled={g.presente}
                    onChange={() =>
                      !g.presente && handleMarkGuest(g.id)
                    }
                    className="h-5 w-5 cursor-pointer rounded border-gold/30 text-wine focus:ring-gold disabled:cursor-default"
                  />

                  <label
                    htmlFor={`guest-${g.id}`}
                    className={`cursor-pointer font-body text-sm ${
                      g.presente
                        ? "text-charcoal/50 line-through"
                        : "text-charcoal"
                    }`}
                  >
                    {g.nombre}
                  </label>
                </div>

                <span className="rounded bg-gold/10 px-2 py-0.5 text-xxs font-semibold uppercase tracking-wider text-gold">
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
            <button
              onClick={handleMarkAll}
              className="btn-primary justify-center py-4 text-base"
            >
              MARCAR COMO PRESENTES
            </button>

            <button
              onClick={resetForNext}
              className="btn-outline justify-center"
            >
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

      {/* ========================= */}
      {/* HISTORIAL */}
      {/* ========================= */}

      <div className="mt-12">
        <h3 className="font-display text-xl italic text-wine">
          Historial de asistencia
        </h3>

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
                  <td
                    colSpan={4}
                    className="px-5 py-6 text-center text-charcoal/50"
                  >
                    Aún no se ha registrado ninguna asistencia.
                  </td>
                </tr>
              )}

              {history.map((r) => (
                <tr key={r.id} className="border-t border-gold/10">
                  <td className="px-5 py-3">{r.nombre}</td>

                  <td className="px-5 py-3 font-mono text-xs">
                    {r.codigo}
                  </td>

                  <td className="px-5 py-3">
                    {new Date(r.horaIngreso).toLocaleTimeString("es-PE")}
                  </td>

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

