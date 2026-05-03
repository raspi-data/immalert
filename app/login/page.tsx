"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already authenticated — skip login form
  useEffect(() => {
    if (status === "authenticated") window.location.href = "/dashboard";
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setLoading(false);
      setError("Email sau parolă incorectă");
    } else {
      window.location.href = "/dashboard";
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-display font-bold text-2xl text-primary-container">
            ImmAlert
          </Link>
          <h1 className="font-display font-bold text-on-surface mt-4" style={{ fontSize: 24, lineHeight: "32px" }}>
            Bun venit înapoi
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">Autentifică-te în contul tău</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-surface-variant p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors placeholder:text-outline"
                placeholder="email@exemplu.ro"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors placeholder:text-outline"
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
              className="w-full bg-primary-container text-white font-display font-semibold py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Se autentifică..." : "Autentifică-te"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Nu ai cont?{" "}
            <Link href="/register" className="text-primary-container font-medium hover:underline">
              Creează unul gratuit
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
