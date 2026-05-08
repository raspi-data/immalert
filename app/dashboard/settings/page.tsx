"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.email) setEmail(data.email); })
      .catch(() => {});
  }, []);

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

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24, lineHeight: "32px" }}>Setări cont</h1>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-surface-variant p-6">
        <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">Informații cont</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-outline font-semibold uppercase tracking-wide mb-1">Email</p>
            <p className="text-on-surface text-sm">{email}</p>
          </div>
          <div>
            <p className="text-xs text-outline font-semibold uppercase tracking-wide mb-1">Acces</p>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container">
              Gratuit — acces complet
            </span>
          </div>
        </div>
      </div>

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
