"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Eroare la înregistrare");
      setLoading(false);
      return;
    }

    // Account created — now sign in and hard-redirect so the server sees the cookie
    const signInResult = await signIn("credentials", { email, password, redirect: false });
    if (signInResult?.error) {
      // Account exists but auto-login failed — send to login page
      window.location.href = "/login";
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-display font-bold text-2xl text-primary-container">
            ImmAlert
          </Link>
          <h1 className="font-display font-bold text-on-surface mt-4" style={{ fontSize: 24, lineHeight: "32px" }}>
            14 zile gratuit
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">Fără card &bull; Anulezi oricând</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-surface-variant p-8">
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mb-6 pb-5 border-b border-surface-container">
            {["Fără card", "14 zile gratuit", "Anulezi oricând"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 14 }}>check_circle</span>
                {badge}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">
                Nume <span className="text-outline font-normal">(opțional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors placeholder:text-outline"
                placeholder="Ion Popescu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors placeholder:text-outline"
                placeholder="email@exemplu.ro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors placeholder:text-outline"
                placeholder="Minim 6 caractere"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-white font-display font-semibold py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Se creează contul..."
              ) : (
                <>
                  Creează cont gratuit
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-outline mt-4">
            Prin înregistrare ești de acord cu termenii și condițiile serviciului.
          </p>

          <p className="text-center text-sm text-on-surface-variant mt-4">
            Ai deja cont?{" "}
            <Link href="/login" className="text-primary-container font-medium hover:underline">
              Autentifică-te
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-outline mt-6">
          <Link href="/" className="hover:text-on-surface-variant transition-colors flex items-center justify-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Înapoi la pagina principală
          </Link>
        </p>
      </div>
    </div>
  );
}
