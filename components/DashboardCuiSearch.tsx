"use client";

import { useState } from "react";
import type { FirmaData } from "@/lib/anaf";

interface Props {
  onAdded: () => void;
}

function Badge({ ok, labelOk, labelNot }: { ok: boolean; labelOk: string; labelNot: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
      {labelOk}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>cancel</span>
      {labelNot}
    </span>
  );
}

export default function DashboardCuiSearch({ onAdded }: Props) {
  const [cui, setCui] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<FirmaData | null>(null);
  const [searchError, setSearchError] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [added, setAdded] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError("");
    setResult(null);
    setAddError("");
    setAdded(false);
    const trimmed = cui.trim().replace(/^RO/i, "");
    if (!/^\d{2,10}$/.test(trimmed)) {
      setSearchError("CUI-ul trebuie să conțină între 2 și 10 cifre.");
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/anaf?cui=${trimmed}`);
    const data = await res.json();
    if (!res.ok) {
      setSearchError(data.error || "CUI-ul nu a fost găsit în ANAF.");
    } else {
      setResult(data);
    }
    setSearching(false);
  }

  async function handleAdd() {
    if (!result) return;
    setAddError("");
    setAdding(true);
    const trimmed = result.cui.replace(/^RO/i, "");
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cui: trimmed }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAddError(data.error || "Eroare la adăugare.");
    } else {
      setAdded(true);
      setCui("");
      setResult(null);
      onAdded();
    }
    setAdding(false);
  }

  function handleReset() {
    setCui("");
    setResult(null);
    setSearchError("");
    setAddError("");
    setAdded(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-variant overflow-hidden">
      {/* Search form */}
      <div className="p-6">
        <h2 className="font-display font-semibold text-on-surface text-sm mb-4">
          Adaugă firmă la monitorizare
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: 20 }}>
              badge
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={cui}
              onChange={(e) => { setCui(e.target.value); setResult(null); setSearchError(""); setAdded(false); }}
              placeholder="Introdu CUI-ul firmei (ex: 12345678)"
              className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-xl text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-colors"
              disabled={searching}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !cui.trim()}
            className="bg-primary-container text-white font-display font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap text-sm flex items-center gap-2"
          >
            {searching ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Se caută...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
                Caută
              </>
            )}
          </button>
        </form>

        {searchError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-on-error-container bg-error-container px-4 py-2.5 rounded-xl">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
            {searchError}
          </div>
        )}
      </div>

      {/* Result card */}
      {result && (
        <div className="border-t border-surface-variant">
          {/* Company header */}
          <div className="px-6 py-4 bg-surface-container/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>apartment</span>
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-on-surface text-sm leading-tight truncate">{result.denumire}</p>
                <p className="text-xs text-outline mt-0.5">
                  CUI {result.cui}
                  {result.nr_reg_com && <> · {result.nr_reg_com}</>}
                </p>
              </div>
            </div>
            <button onClick={handleReset} className="text-outline hover:text-on-surface transition-colors flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* Status badges */}
          <div className="px-6 py-3 flex flex-wrap gap-2 border-b border-surface-variant">
            <Badge ok={!result.inactiv} labelOk="Activă fiscal" labelNot="INACTIVĂ fiscal" />
            <Badge ok={result.tva} labelOk="Plătitor TVA" labelNot="Neplătitor TVA" />
            <Badge ok={result.e_factura} labelOk="e-Factura" labelNot="Fără e-Factura" />
            {result.data_radiere && (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>warning</span>
                RADIATĂ
              </span>
            )}
          </div>

          {/* Key details */}
          <div className="px-6 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border-b border-surface-variant">
            {result.adresa && (
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-outline mt-0.5" style={{ fontSize: 16 }}>location_on</span>
                <span className="text-sm text-on-surface-variant leading-snug">{result.adresa}</span>
              </div>
            )}
            {result.stare && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>info</span>
                <span className="text-sm text-on-surface-variant">{result.stare}</span>
              </div>
            )}
            {result.cod_caen && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>category</span>
                <span className="text-sm text-on-surface-variant">CAEN: {result.cod_caen}</span>
              </div>
            )}
            {result.data_inregistrare && (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>calendar_today</span>
                <span className="text-sm text-on-surface-variant">Înreg. {result.data_inregistrare}</span>
              </div>
            )}
          </div>

          {/* Add button */}
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-sm text-on-surface-variant">
              Vrei să primești alerte când se schimbă ceva la această firmă?
            </p>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex-shrink-0 bg-primary-container text-white font-display font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center gap-2"
            >
              {adding ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Se adaugă...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_alert</span>
                  Adaugă la monitorizare
                </>
              )}
            </button>
          </div>

          {addError && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 text-sm text-on-error-container bg-error-container px-4 py-2.5 rounded-xl">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
                {addError}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
