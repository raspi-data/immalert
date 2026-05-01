"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const PLANS = {
  monthly: { label: "Lunar", price: "99 RON/lună", desc: "Facturare lunară" },
  annual: { label: "Anual", price: "79 RON/lună", desc: "948 RON/an, economisești 240 RON" },
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
      setPwMsg("Parola a fost schimbată cu succes!");
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
      <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24, lineHeight: "32px" }}>Setări cont</h1>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-surface-variant p-6">
        <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">Informații cont</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-outline font-semibold uppercase tracking-wide mb-1">Email</p>
            <p className="text-on-surface text-sm">{session?.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-outline font-semibold uppercase tracking-wide mb-1">Status abonament</p>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : isTrial
                  ? "bg-surface-container text-primary-container"
                  : "bg-error-container text-on-error-container"
              }`}
            >
              {isActive ? "Activ" : isTrial ? "Trial gratuit (14 zile)" : "Expirat"}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      {!isActive && (
        <div className="bg-white rounded-2xl border border-surface-variant p-6">
          <h2 className="font-display font-semibold text-on-surface mb-1.5 text-sm">Alege un plan</h2>
          <p className="text-on-surface-variant text-sm mb-5">
            {isTrial
              ? "Trialul tău expiră în curând. Alege un plan pentru a continua."
              : "Activează un abonament pentru a continua să folosești ImmAlert."}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`border-2 rounded-2xl p-5 ${key === "annual" ? "border-primary-container" : "border-surface-variant"}`}
              >
                {key === "annual" && (
                  <p className="text-xs font-bold text-primary-container mb-2">RECOMANDAT</p>
                )}
                <h3 className="font-display font-bold text-on-surface text-sm">{plan.label}</h3>
                <p className={`font-display font-bold mt-1 ${key === "annual" ? "text-primary-container" : "text-on-surface"}`} style={{ fontSize: 20 }}>
                  {plan.price}
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5 mb-4">{plan.desc}</p>
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={!!stripeLoading}
                  className={`w-full font-display font-semibold py-2.5 rounded-xl transition-all active:scale-95 text-sm disabled:opacity-50 ${
                    key === "annual"
                      ? "bg-primary-container text-white hover:opacity-90"
                      : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {stripeLoading === key ? "Se redirecționează..." : "Alege planul"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isActive && (
        <div className="bg-white rounded-2xl border border-surface-variant p-6">
          <h2 className="font-display font-semibold text-on-surface mb-1.5 text-sm">Abonament activ</h2>
          <p className="text-on-surface-variant text-sm mb-4">Gestionează abonamentul tău din portalul Stripe.</p>
          <p className="text-on-surface-variant text-sm">
            Pentru a anula abonamentul sau a modifica planul, contactează-ne la{" "}
            <a href="mailto:suport@immalert.ro" className="text-primary-container hover:underline">
              suport@immalert.ro
            </a>
            .
          </p>
        </div>
      )}

      {/* Password Change */}
      <div className="bg-white rounded-2xl border border-surface-variant p-6">
        <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">Schimbă parola</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Parola actuală</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Parola nouă</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
              required
              minLength={6}
            />
          </div>
          {pwMsg && (
            <div className="flex items-center gap-2 text-sm text-primary-container bg-secondary-container/30 px-4 py-3 rounded-xl">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              {pwMsg}
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2 text-sm text-on-error-container bg-error-container px-4 py-3 rounded-xl">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {pwError}
            </div>
          )}
          <button
            type="submit"
            disabled={pwLoading}
            className="bg-on-surface text-inverse-on-surface font-display font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            {pwLoading ? "Se salvează..." : "Schimbă parola"}
          </button>
        </form>
      </div>
    </div>
  );
}
