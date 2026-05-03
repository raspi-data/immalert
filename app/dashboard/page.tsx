"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Company {
  id: string;
  cui: string;
  nume: string;
  lastChecked: string | null;
  dateAnaf: {
    tva?: boolean;
    inactiv?: boolean;
    e_factura?: boolean;
    adresa?: string;
    stare?: string;
    data_radiere?: string;
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
      setAddError(data.error || "Eroare la adăugare");
    } else {
      setCui("");
      setPreview(null);
      await loadCompanies();
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Ești sigur că vrei să ștergi această firmă?")) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    await loadCompanies();
  }

  const totalAlerts = companies.reduce((acc, c) => acc + c.alerts.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24, lineHeight: "32px" }}>Dashboard</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {companies.length} {companies.length === 1 ? "firmă monitorizată" : "firme monitorizate"}
            {totalAlerts > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-error-container text-on-error-container text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {totalAlerts} alerte necitite
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Add company form */}
      <div className="bg-white rounded-2xl border border-surface-variant p-6">
        <h2 className="font-display font-semibold text-on-surface mb-4 text-sm">Adaugă firmă după CUI</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={cui}
              onChange={(e) => { setCui(e.target.value); setPreview(null); }}
              onBlur={handleCuiBlur}
              placeholder="Ex: 1234567"
              className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors placeholder:text-outline"
              pattern="\d+"
            />
            {previewing && <p className="text-xs text-outline mt-1.5">Se verifică CUI-ul...</p>}
            {preview && (
              <div className="mt-2 p-3 bg-secondary-container/30 rounded-xl border border-primary-container/20">
                <p className="font-semibold text-on-surface text-sm">{preview.denumire}</p>
                <p className="text-primary-container text-xs mt-0.5">{preview.adresa}</p>
              </div>
            )}
            {addError && <p className="text-xs text-error mt-1.5">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={adding || !cui}
            className="bg-primary-container text-white font-display font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap text-sm"
          >
            {adding ? "Se adaugă..." : "Adaugă firma"}
          </button>
        </form>
      </div>

      {/* Companies list */}
      <div>
        <h2 className="font-display font-semibold text-on-surface mb-4 text-sm">Firme monitorizate</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-surface-variant h-20 animate-pulse" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-surface-variant p-12 text-center">
            <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 28 }}>business</span>
            </div>
            <p className="font-display font-semibold text-on-surface">Nicio firmă monitorizată încă</p>
            <p className="text-on-surface-variant text-sm mt-1">Adaugă primul CUI mai sus pentru a începe monitorizarea</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => {
              const hasAlerts = company.alerts.length > 0;
              const isInactive = company.dateAnaf?.inactiv;
              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-xl border p-5 flex items-center justify-between hover:shadow-sm transition-all ${
                    isInactive
                      ? "border-error/30"
                      : hasAlerts
                      ? "border-tertiary/40"
                      : "border-surface-variant"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isInactive ? "bg-error" : hasAlerts ? "bg-tertiary" : "bg-primary-container"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/companies/${company.id}`}
                          className="font-display font-semibold text-on-surface hover:text-primary-container text-sm transition-colors"
                        >
                          {company.nume}
                        </Link>
                        {hasAlerts && (
                          <span className="bg-error-container text-on-error-container text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {company.alerts.length} alertă
                          </span>
                        )}
                        {isInactive && (
                          <span className="bg-error-container text-on-error-container text-xs font-bold px-2.5 py-0.5 rounded-full">
                            INACTIVĂ
                          </span>
                        )}
                      </div>
                      <p className="text-on-surface-variant text-xs mt-0.5">
                        CUI: {company.cui}
                        {company.dateAnaf?.tva && " • TVA activ"}
                        {company.dateAnaf?.e_factura && " • e-Factura"}
                        {company.dateAnaf?.data_radiere && " • RADIATĂ"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/dashboard/companies/${company.id}`}
                      className="flex items-center gap-1 text-sm text-primary-container hover:opacity-75 font-medium transition-opacity"
                    >
                      Detalii
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-sm text-outline hover:text-error transition-colors"
                    >
                      Șterge
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
