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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {companies.length} {companies.length === 1 ? "firmă monitorizată" : "firme monitorizate"}
            {totalAlerts > 0 && ` • ${totalAlerts} alerte necitite`}
          </p>
        </div>
      </div>

      {/* Add company form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Adaugă firmă după CUI</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={cui}
              onChange={(e) => { setCui(e.target.value); setPreview(null); }}
              onBlur={handleCuiBlur}
              placeholder="Ex: 1234567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="\d+"
            />
            {previewing && <p className="text-xs text-gray-400 mt-1">Se verifică CUI-ul...</p>}
            {preview && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-semibold text-blue-900">{preview.denumire}</p>
                <p className="text-blue-700 text-xs mt-0.5">{preview.adresa}</p>
              </div>
            )}
            {addError && <p className="text-xs text-red-600 mt-1">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={adding || !cui}
            className="bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {adding ? "Se adaugă..." : "Adaugă firmă"}
          </button>
        </form>
      </div>

      {/* Companies list */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Firme monitorizate</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🏢</p>
            <p className="text-gray-900 font-semibold">Nicio firmă monitorizată încă</p>
            <p className="text-gray-500 text-sm mt-1">Adaugă primul CUI mai sus pentru a începe monitorizarea</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => {
              const hasAlerts = company.alerts.length > 0;
              const isInactive = company.dateAnaf?.statusInactivi;
              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-xl border ${hasAlerts ? "border-red-200" : "border-gray-100"} p-5 flex items-center justify-between hover:border-blue-200 transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isInactive ? "bg-red-500" : hasAlerts ? "bg-yellow-400" : "bg-green-400"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/companies/${company.id}`} className="font-semibold text-gray-900 hover:text-blue-700">
                          {company.nume}
                        </Link>
                        {hasAlerts && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {company.alerts.length} alertă
                          </span>
                        )}
                        {isInactive && (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            INACTIVĂ
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        CUI: {company.cui}
                        {company.dateAnaf?.scpTVA && " • TVA activ"}
                        {company.dateAnaf?.statusEFactura && " • e-Factura"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/companies/${company.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Detalii →
                    </Link>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-sm text-gray-400 hover:text-red-600"
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
