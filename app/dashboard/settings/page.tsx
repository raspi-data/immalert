"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const PLANS = {
  monthly: { label: "Lunar", price: "99 RON/luna", desc: "Facturare lunara" },
  annual: { label: "Anual", price: "79 RON/luna", desc: "948 RON/an, economisesti 240 RON" },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState<string | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    setPwError("");
    setPwLoading(true);

    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setPwMsg("Parola a fost schimbata cu succes!");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      const data = await res.json();
      setPwError(data.error || "Eroare la schimbarea parolei");
    }
    setPwLoading(false);
  }

  async function handleSubscribe(plan: string) {
    setStripeLoading(plan);
    const res = await fetch("/api/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (res.ok) {
      const { url } = await res.json();
      if (url) window.location.href = url;
    }
    setStripeLoading(null);
  }

  const isTrial = session?.user.subscriptionStatus === "trial";
  const isActive = session?.user.subscriptionStatus === "active";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[--color-foreground]">Setari cont</h1>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-[--color-border] p-6">
        <h2 className="font-semibold text-[--color-foreground] mb-5 text-sm">Informatii cont</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[--color-muted-light] uppercase tracking-wide font-medium mb-1">Email</p>
            <p className="text-[--color-foreground] text-sm">{session?.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-[--color-muted-light] uppercase tracking-wide font-medium mb-1">Status abonament</p>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isActive
                  ? "bg-[--color-success-bg] text-[--color-success]"
                  : isTrial
                  ? "bg-[--color-brand-light] text-[--color-brand]"
                  : "bg-[--color-danger-bg] text-[--color-danger]"
              }`}
            >
              {isActive ? "Activ" : isTrial ? "Trial gratuit (14 zile)" : "Expirat"}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      {!isActive && (
        <div className="bg-white rounded-2xl border border-[--color-border] p-6">
          <h2 className="font-semibold text-[--color-foreground] mb-1.5 text-sm">Alege un plan</h2>
          <p className="text-[--color-muted] text-sm mb-5">
            {isTrial
              ? "Trialul tau expira in curand. Alege un plan pentru a continua."
              : "Activeaza un abonament pentru a continua sa folosesti ImmAlert."}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`border-2 rounded-xl p-5 ${key === "annual" ? "border-[--color-brand]" : "border-[--color-border]"}`}
              >
                {key === "annual" && (
                  <p className="text-xs font-bold text-[--color-success] mb-2">RECOMANDAT</p>
                )}
                <h3 className="font-bold text-[--color-foreground] text-sm">{plan.label}</h3>
                <p className={`text-xl font-bold mt-1 ${key === "annual" ? "text-[--color-brand]" : "text-[--color-foreground]"}`}>
                  {plan.price}
                </p>
                <p className="text-[--color-muted] text-xs mt-0.5 mb-4">{plan.desc}</p>
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={!!stripeLoading}
                  className={`w-full font-medium py-2 rounded-lg transition-colors text-sm disabled:opacity-50 ${
                    key === "annual"
                      ? "bg-[--color-brand] text-white hover:bg-[--color-brand-dark]"
                      : "border border-[--color-border] text-[--color-foreground] hover:bg-[--color-surface]"
                  }`}
                >
                  {stripeLoading === key ? "Se redirectioneaza..." : "Alege planul"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isActive && (
        <div className="bg-white rounded-2xl border border-[--color-border] p-6">
          <h2 className="font-semibold text-[--color-foreground] mb-1.5 text-sm">Abonament activ</h2>
          <p className="text-[--color-muted] text-sm mb-4">Gestioneaza abonamentul tau din portalul Stripe.</p>
          <p className="text-[--color-muted] text-sm">
            Pentru a anula abonamentul sau a modifica planul, contacteaza-ne la{" "}
            <a href="mailto:suport@immalert.ro" className="text-[--color-brand] hover:underline">
              suport@immalert.ro
            </a>
            .
          </p>
        </div>
      )}

      {/* Password Change */}
      <div className="bg-white rounded-2xl border border-[--color-border] p-6">
        <h2 className="font-semibold text-[--color-foreground] mb-5 text-sm">Schimba parola</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[--color-foreground] mb-1.5">Parola actuala</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[--color-foreground] mb-1.5">Parola noua</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition-colors"
              required
              minLength={6}
            />
          </div>
          {pwMsg && (
            <p className="text-sm text-[--color-success] flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {pwMsg}
            </p>
          )}
          {pwError && <p className="text-sm text-[--color-danger]">{pwError}</p>}
          <button
            type="submit"
            disabled={pwLoading}
            className="bg-[--color-foreground] text-white font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {pwLoading ? "Se salveaza..." : "Schimba parola"}
          </button>
        </form>
      </div>
    </div>
  );
}
