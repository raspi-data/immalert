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
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Setări cont</h1>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Informații cont</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email</p>
            <p className="text-gray-800 mt-0.5">{session?.user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Status abonament</p>
            <p className="mt-0.5">
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                isActive ? "bg-green-100 text-green-700" : isTrial ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
              }`}>
                {isActive ? "Activ" : isTrial ? "Trial gratuit (14 zile)" : "Expirat"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      {!isActive && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Alege un plan</h2>
          <p className="text-gray-500 text-sm mb-5">
            {isTrial ? "Trialul tău expiră în curând. Alege un plan pentru a continua." : "Activează un abonament pentru a continua să folosești ImmAlert."}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div key={key} className={`border-2 rounded-xl p-5 ${key === "annual" ? "border-blue-700" : "border-gray-200"}`}>
                {key === "annual" && (
                  <p className="text-xs font-bold text-green-700 mb-2">RECOMANDAT</p>
                )}
                <h3 className="font-bold text-gray-900">{plan.label}</h3>
                <p className="text-xl font-bold text-blue-700 mt-1">{plan.price}</p>
                <p className="text-gray-500 text-xs mt-0.5 mb-4">{plan.desc}</p>
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={!!stripeLoading}
                  className={`w-full font-medium py-2 rounded-lg transition-colors text-sm disabled:opacity-50 ${
                    key === "annual"
                      ? "bg-blue-700 text-white hover:bg-blue-800"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Abonament activ</h2>
          <p className="text-gray-500 text-sm mb-4">Gestionează abonamentul tău din portalul Stripe.</p>
          <p className="text-gray-500 text-sm">
            Pentru a anula abonamentul sau a modifica planul, contactează-ne la{" "}
            <a href="mailto:suport@immalert.ro" className="text-blue-700 hover:underline">suport@immalert.ro</a>.
          </p>
        </div>
      )}

      {/* Password Change */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Schimbă parola</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parola actuală</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parola nouă</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          {pwMsg && <p className="text-green-600 text-sm">{pwMsg}</p>}
          {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
          <button
            type="submit"
            disabled={pwLoading}
            className="bg-gray-900 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {pwLoading ? "Se salvează..." : "Schimbă parola"}
          </button>
        </form>
      </div>
    </div>
  );
}
