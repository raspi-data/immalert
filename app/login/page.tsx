"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Email sau parola incorecta");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[--color-surface] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-[--color-brand]">
            ImmAlert
          </Link>
          <h1 className="text-2xl font-bold text-[--color-foreground] mt-4">Bun venit inapoi</h1>
          <p className="text-[--color-muted] mt-1 text-sm">Autentifica-te in contul tau</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[--color-border] p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                required
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
              className="w-full bg-[--color-brand] text-white font-semibold py-2.5 rounded-lg hover:bg-[--color-brand-dark] transition-colors disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Se autentifica..." : "Autentifica-te"}
            </button>
          </form>

          <p className="text-center text-sm text-[--color-muted] mt-6">
            Nu ai cont?{" "}
            <Link href="/register" className="text-[--color-brand] font-medium hover:underline">
              Creeaza unul gratuit
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
