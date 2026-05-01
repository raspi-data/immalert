"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Company {
  id: string;
  cui: string;
  nume: string;
  lastChecked: string | null;
  dateAnaf: {
    scpTVA?: boolean;
    statusInactivi?: boolean;
    statusEFactura?: boolean;
    adresa?: string;
  } | null;
  alerts: { id: string }[];
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [cui, setCui] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [preview, setPreview] = useState<{ denumire: string; adresa: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);

  async function loadCompanies() {
    const res = await fetch("/api/companies");
    if (res.ok) setCompanies(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadCompanies(); }, []);

  async function handleCuiBlur() {
    if (!/^\d{2,10}$/.test(cui)) return;
    setPreviewing(true);
    setPreview(null);
    const res = await fetch(`/api/anaf?cui=${cui}`);
    if (res.ok) {
      const data = await res.json();
      setPreview({ denumire: data.denumire, adresa: data.adresa });
    }
    setPreviewing(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAdding(true);

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cui }),
    });

    if (!res.ok) {
      const data = await res.json();
      setAddError(data.error || "Eroare la adaugare");
    } else {
      setCui("");
      setPreview(null);
      await loadCompanies();
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Esti sigur ca vrei sa stergi aceasta firma?")) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    await loadCompanies();
  }

  const totalAlerts = companies.reduce((acc, c) => acc + c.alerts.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[--color-foreground]">Dashboard</h1>
          <p className="text-[--color-muted] text-sm mt-1">
            {companies.length} {companies.length === 1 ? "firma monitorizata" : "firme monitorizate"}
            {totalAlerts > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-[--color-danger-bg] text-[--color-danger] text-xs font-semibold px-2 py-0.5 rounded-full">
                {totalAlerts} alerte necitite
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Add company form */}
      <div className="bg-white rounded-2xl border border-[--color-border] p-6">
        <h2 className="font-semibold text-[--color-foreground] mb-4 text-sm">Adauga firma dupa CUI</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={cui}
              onChange={(e) => { setCui(e.target.value); setPreview(null); }}
              onBlur={handleCuiBlur}
              placeholder="Ex: 1234567"
              className="w-full border border-[--color-border] rounded-lg px-3 py-2.5 text-[--color-foreground] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand] focus:border-transparent transition-colors placeholder:text-[--color-muted-light]"
              pattern="\d+"
            />
            {previewing && <p className="text-xs text-[--color-muted] mt-1.5">Se verifica CUI-ul...</p>}
            {preview && (
              <div className="mt-2 p-3 bg-[--color-brand-light] rounded-lg border border-[--color-brand]/20">
                <p className="font-semibold text-[--color-foreground] text-sm">{preview.denumire}</p>
                <p className="text-[--color-brand] text-xs mt-0.5">{preview.adresa}</p>
              </div>
            )}
            {addError && <p className="text-xs text-[--color-danger] mt-1.5">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={adding || !cui}
            className="bg-[--color-brand] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[--color-brand-dark] transition-colors disabled:opacity-50 whitespace-nowrap text-sm"
          >
            {adding ? "Se adauga..." : "Adauga firma"}
          </button>
        </form>
      </div>

      {/* Companies list */}
      <div>
        <h2 className="font-semibold text-[--color-foreground] mb-4 text-sm">Firme monitorizate</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[--color-border] h-20 animate-pulse" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[--color-border] p-12 text-center">
            <div className="w-12 h-12 bg-[--color-brand-light] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--color-brand)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <p className="text-[--color-foreground] font-semibold">Nicio firma monitorizata inca</p>
            <p className="text-[--color-muted] text-sm mt-1">Adauga primul CUI mai sus pentru a incepe monitorizarea</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => {
              const hasAlerts = company.alerts.length > 0;
              const isInactive = company.dateAnaf?.statusInactivi;
              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-xl border p-5 flex items-center justify-between hover:border-[--color-brand]/40 transition-colors ${
                    isInactive
                      ? "border-[--color-danger]/30"
                      : hasAlerts
                      ? "border-[--color-warning]/40"
                      : "border-[--color-border]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isInactive ? "bg-[--color-danger]" : hasAlerts ? "bg-[--color-warning]" : "bg-[--color-success]"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/companies/${company.id}`}
                          className="font-semibold text-[--color-foreground] hover:text-[--color-brand] text-sm transition-colors"
                        >
                          {company.nume}
                        </Link>
                        {hasAlerts && (
                          <span className="bg-[--color-danger-bg] text-[--color-danger] text-xs font-bold px-2 py-0.5 rounded-full">
                            {company.alerts.length} alerta
                          </span>
                        )}
                        {isInactive && (
                          <span className="bg-[--color-danger-bg] text-[--color-danger] text-xs font-bold px-2 py-0.5 rounded-full">
                            INACTIVA
                          </span>
                        )}
                      </div>
                      <p className="text-[--color-muted] text-xs mt-0.5">
                        CUI: {company.cui}
                        {company.dateAnaf?.scpTVA && " • TVA activ"}
                        {company.dateAnaf?.statusEFactura && " • e-Factura"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/dashboard/companies/${company.id}`}
                      className="text-sm text-[--color-brand] hover:text-[--color-brand-dark] font-medium transition-colors"
                    >
                      Detalii &rarr;
                    </Link>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-sm text-[--color-muted-light] hover:text-[--color-danger] transition-colors"
                    >
                      Sterge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
