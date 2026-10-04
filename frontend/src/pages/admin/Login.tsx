import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch {
      setError("Credenciales inválidas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-wine px-6">
      <div className="w-full max-w-sm rounded-2xl bg-ivory p-10 shadow-xl">
        <p className="text-center font-script text-4xl text-wine">J &amp; E</p>
        <h1 className="mt-2 text-center font-display text-2xl italic text-charcoal">
          Panel administrativo
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-charcoal/60">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gold/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-charcoal/60">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gold/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          {error && <p className="text-sm text-wine">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2 justify-center">
            <LogIn size={16} />
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
