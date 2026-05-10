"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCuiSearch from "@/components/DashboardCuiSearch";

interface Company {
  id: string;
  cui: string;
  nume: string;
  lastChecked: string | null;
  dateAnaf: {
    tva?: boolean;
    inactiv?: boolean;
    e_factura?: boolean;
    stare?: string;
    data_radiere?: string;
  } | null;
  alerts: { id: string }[];
}

function StatusChip({ label, variant }: { label: string; variant: "green" | "blue" | "red" | "gray" }) {
  const styles = {
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-surface-container text-on-surface-variant border-surface-variant",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${styles[variant]}`}>
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  async function loadCompanies() {
    const res = await fetch("/api/companies");
    const data = await res.json();
    if (res.ok && Array.isArray(data)) setCompanies(data);
    setLoading(false);
  }

  useEffect(() => { loadCompanies(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Ștergi firma din monitorizare?")) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }

  const totalAlerts = companies.reduce((acc, c) => acc + c.alerts.length, 0);
  const lastChecked = companies
    .map((c) => c.lastChecked)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-on-surface text-2xl">Dashboard</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            {new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setShowSearch((v) => !v)}
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Adaugă firmă
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon="apartment"
          label="Firme monitorizate"
          value={loading ? "—" : String(companies.length)}
          iconColor="text-primary"
          iconBg="bg-primary-container/40"
        />
        <KpiCard
          icon="notifications"
          label="Alerte necitite"
          value={loading ? "—" : String(totalAlerts)}
          iconColor={totalAlerts > 0 ? "text-error" : "text-primary"}
          iconBg={totalAlerts > 0 ? "bg-error-container" : "bg-primary-container/40"}
          href={totalAlerts > 0 ? "/dashboard/alerts" : undefined}
        />
        <KpiCard
          icon="schedule"
          label="Ultima verificare"
          value={lastChecked ? new Date(lastChecked).toLocaleDateString("ro-RO") : "—"}
          iconColor="text-primary"
          iconBg="bg-primary-container/40"
        />
      </div>

      {/* Search panel */}
      {showSearch && (
        <div className="bg-surface border border-surface-variant rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-on-surface text-sm">Caută și adaugă firmă</h2>
            <button onClick={() => setShowSearch(false)} className="text-outline hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>
          <DashboardCuiSearch onAdded={() => { loadCompanies(); setShowSearch(false); }} />
        </div>
      )}

      {/* Companies table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-on-surface text-sm">
            Firme monitorizate
            {!loading && companies.length > 0 && (
              <span className="ml-2 text-outline font-normal">({companies.length})</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="bg-surface border border-surface-variant rounded-lg overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-surface-variant last:border-0">
                <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded animate-pulse w-48" />
                  <div className="h-3 bg-surface-container rounded animate-pulse w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-surface border border-surface-variant rounded-lg p-16 text-center">
            <div className="w-16 h-16 bg-primary-container/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>
                domain_add
              </span>
            </div>
            <p className="font-display font-semibold text-on-surface">Nicio firmă monitorizată</p>
            <p className="text-on-surface-variant text-sm mt-1 mb-4">Adaugă prima firmă introducând CUI-ul</p>
            <button
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-all duration-200"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Adaugă firmă
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-surface-variant rounded-lg overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container/60">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Firmă</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">CUI</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Verificat</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {companies.map((company) => {
                  const hasAlerts = company.alerts.length > 0;
                  const isInactive = company.dateAnaf?.inactiv;
                  const isRadiata = !!company.dateAnaf?.data_radiere;
                  const critical = isInactive || isRadiata;

                  return (
                    <tr key={company.id} className="hover:bg-surface-container/30 transition-colors duration-150">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                            critical ? "bg-error-container text-on-error-container" :
                            hasAlerts ? "bg-tertiary-container text-on-tertiary-container" :
                            "bg-primary-container/50 text-primary"
                          }`}>
                            {company.nume.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/companies/${company.id}`}
                              className="font-display font-semibold text-on-surface hover:text-primary transition-colors text-sm"
                            >
                              {company.nume}
                            </Link>
                            {hasAlerts && (
                              <Link href="/dashboard/alerts" className="ml-2 text-[10px] font-bold text-error bg-error-container px-1.5 py-0.5 rounded-full">
                                {company.alerts.length} alertă
                              </Link>
                            )}
                            <p className="text-[11px] text-outline mt-0.5 sm:hidden">CUI {company.cui}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-on-surface-variant font-mono">{company.cui}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {critical && <StatusChip label={isInactive ? "Inactivă" : "Radiată"} variant="red" />}
                          {!critical && company.dateAnaf?.tva && <StatusChip label="TVA" variant="green" />}
                          {!critical && company.dateAnaf?.e_factura && <StatusChip label="e-Factura" variant="blue" />}
                          {!critical && !company.dateAnaf?.tva && !company.dateAnaf?.e_factura && (
                            <StatusChip label="Activă" variant="gray" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-outline">
                          {company.lastChecked ? new Date(company.lastChecked).toLocaleDateString("ro-RO") : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/companies/${company.id}`}
                            className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5 transition-colors"
                          >
                            Detalii
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="text-outline hover:text-error transition-colors duration-200 ml-1"
                            title="Șterge"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, iconColor, iconBg, href,
}: { icon: string; label: string; value: string; iconColor: string; iconBg: string; href?: string }) {
  const content = (
    <div className="bg-surface border border-surface-variant rounded-lg p-5 flex items-center gap-4 hover:border-outline-variant transition-all duration-200 hover:shadow-sm group">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <span className={`material-symbols-outlined ${iconColor}`} style={{ fontSize: 22, fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="font-display font-bold text-on-surface text-2xl mt-0.5 leading-tight">{value}</p>
      </div>
      {href && (
        <span className="material-symbols-outlined text-outline ml-auto group-hover:text-primary transition-colors" style={{ fontSize: 18 }}>
          arrow_forward
        </span>
      )}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
