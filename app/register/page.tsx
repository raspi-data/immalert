"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
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
      setError(data.error || "Eroare la inregistrare");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[--color-surface] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-[--color-brand]">
            ImmAlert
          </Link>
          <h1 className="text-2xl font-bold text-[--color-foreground] mt-4">14 zile gratuit</h1>
          <p className="text-[--color-muted] mt-1 text-sm">Fara card &bull; Anulezi oricand</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[--color-border] p-8">
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mb-6 pb-5 border-b border-[--color-border-light]">
            {[
              { label: "Fara card" },
              { label: "14 zile gratuit" },
              { label: "Anulezi oricand" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5 text-xs text-[--color-muted]">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {badge.label}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[--color-foreground] mb-1.5">
                Nume <span className="text-[--color-muted-light] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-[--color-foreground] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition-colors placeholder:text-[--color-muted-light]"
                placeholder="Ion Popescu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-foreground] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-[--color-foreground] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition-colors placeholder:text-[--color-muted-light]"
                placeholder="email@exemplu.ro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[--color-foreground] mb-1.5">Parola</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-[--color-foreground] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition-colors placeholder:text-[--color-muted-light]"
                placeholder="Minim 6 caractere"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-[--color-danger-bg] border border-[--color-danger]/20 text-[--color-danger] text-sm px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[--color-brand] text-white font-semibold py-2.5 rounded-lg hover:bg-[--color-brand-dark] transition-colors disabled:opacity-50 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                "Se creeaza contul..."
              ) : (
                <>
                  Creeaza cont gratuit
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[--color-muted-light] mt-4">
            Prin inregistrare esti de acord cu termenii si conditiile serviciului.
          </p>

          <p className="text-center text-sm text-[--color-muted] mt-4">
            Ai deja cont?{" "}
            <Link href="/login" className="text-[--color-brand] font-medium hover:underline">
              Autentifica-te
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-[--color-muted-light] mt-6">
          <Link href="/" className="hover:text-[--color-muted] transition-colors">
            &larr; Inapoi la pagina principala
          </Link>
        </p>
      </div>
    </div>
  );
}
