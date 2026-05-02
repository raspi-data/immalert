"use client";

import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

export default function HeroCheckForm() {
  const [cui, setCui] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [companyName, setCompanyName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const res = await fetch("/api/quick-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cui: cui.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setMessage(data.error || "A aparut o eroare.");
        return;
      }

      setState("success");
      setCompanyName(data.company?.denumire || "firma");
    } catch {
      setState("error");
      setMessage("Eroare de retea. Verifica conexiunea si incearca din nou.");
    }
  }

  function handleReset() {
    setState("idle");
    setCui("");
    setEmail("");
    setMessage("");
    setCompanyName("");
  }

  if (state === "success") {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-surface-variant p-8 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 36 }}>mark_email_read</span>
        </div>
        <div>
          <h3 className="font-display font-bold text-on-surface text-xl mb-2">Raport trimis!</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Raportul pentru <strong className="text-on-surface">{companyName}</strong> a fost trimis la{" "}
            <strong className="text-on-surface">{email}</strong>.
            <br />
            Verifica inbox-ul (sau spam).
          </p>
        </div>
        <div className="w-full border-t border-surface-variant pt-6 flex flex-col gap-3">
          <p className="text-xs text-outline">Vrei monitorizare continua si alerte automate?</p>
          <a
            href="/register"
            className="w-full text-center bg-primary-container text-white py-3 rounded-xl font-display font-semibold text-sm hover:opacity-90 transition-all active:scale-95"
          >
            Incepe Trial Gratuit 14 Zile
          </a>
          <button
            onClick={handleReset}
            className="text-sm text-on-surface-variant hover:text-primary-container transition-colors"
          >
            Verifica alta firma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-surface-variant overflow-hidden">
      {/* Header */}
      <div className="bg-surface-container px-8 py-5 border-b border-surface-variant">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>search</span>
          </div>
          <div>
            <p className="font-display font-semibold text-on-surface text-sm">Verificare rapida firma</p>
            <p className="text-xs text-on-surface-variant">Date in timp real din ANAF</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-5">
        {/* CUI field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hero-cui" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            CUI / Cod Fiscal
          </label>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              style={{ fontSize: 20 }}
            >
              badge
            </span>
            <input
              id="hero-cui"
              type="text"
              inputMode="numeric"
              pattern="\d{2,10}"
              placeholder="ex: 12345678"
              value={cui}
              onChange={(e) => setCui(e.target.value.replace(/\D/g, ""))}
              required
              disabled={state === "loading"}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-variant bg-surface-bright text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40 focus:border-primary-container transition disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hero-email" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            Adresa Email
          </label>
          <div className="relative">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
              style={{ fontSize: 20 }}
            >
              mail
            </span>
            <input
              id="hero-email"
              type="email"
              placeholder="ex: contact@firma.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={state === "loading"}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-variant bg-surface-bright text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/40 focus:border-primary-container transition disabled:opacity-50"
            />
          </div>
        </div>

        {/* Error message */}
        {state === "error" && (
          <div className="flex items-start gap-2 bg-error-container/20 border border-error-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>error</span>
            <p className="text-sm text-error leading-snug">{message}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full bg-primary-container text-white py-3.5 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:scale-100"
        >
          {state === "loading" ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Se verifica...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
              Trimite raport pe email
            </>
          )}
        </button>

        <p className="text-center text-xs text-outline leading-relaxed">
          Datele sunt preluate din surse publice (ANAF). Gratuit, fara cont.
        </p>
      </form>

      {/* Footer badges */}
      <div className="px-8 pb-6 flex flex-wrap gap-3 justify-center">
        {[
          { icon: "verified", text: "Date oficiale ANAF" },
          { icon: "lock", text: "Fara stocare date" },
          { icon: "bolt", text: "Instant" },
        ].map((b) => (
          <div
            key={b.text}
            className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full text-xs text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 14 }}>{b.icon}</span>
            {b.text}
          </div>
        ))}
      </div>
    </div>
  );
}
