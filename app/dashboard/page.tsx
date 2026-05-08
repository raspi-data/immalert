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
    adresa?: string;
    stare?: string;
    data_radiere?: string;
  } | null;
  alerts: { id: string }[];
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCompanies() {
    const res = await fetch("/api/companies");
    const data = await res.json();
    if (res.ok && Array.isArray(data)) setCompanies(data);
    setLoading(false);
  }

  useEffect(() => { loadCompanies(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Ești sigur că vrei să ștergi această firmă din monitorizare?")) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }

  const totalAlerts = companies.reduce((acc, c) => acc + c.alerts.length, 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24, lineHeight: "32px" }}>
          Dashboard
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {companies.length === 0
            ? "Nicio firmă monitorizată încă"
            : `${companies.length} ${companies.length === 1 ? "firmă monitorizată" : "firme monitorizate"}`}
          {totalAlerts > 0 && (
            <Link
              href="/dashboard/alerts"
              className="ml-2 inline-flex items-center gap-1 bg-error-container text-on-error-container text-xs font-semibold px-2.5 py-0.5 rounded-full hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>notifications</span>
              {totalAlerts} {totalAlerts === 1 ? "alertă necitită" : "alerte necitite"}
            </Link>
          )}
        </p>
      </div>

      {/* Search & add */}
      <DashboardCuiSearch onAdded={loadCompanies} />

      {/* Companies table */}
      <div>
        <h2 className="font-display font-semibold text-on-surface text-sm mb-3">
          Firme monitorizate
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-surface-variant h-16 animate-pulse" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-surface-variant p-12 text-center">
            <div className="w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 28 }}>
                business
              </span>
            </div>
            <p className="font-display font-semibold text-on-surface">Nicio firmă monitorizată</p>
            <p className="text-on-surface-variant text-sm mt-1">
              Caută un CUI mai sus pentru a adăuga prima firmă
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-surface-variant overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                    Firmă
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide hidden md:table-cell">
                    Ultima verificare
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {companies.map((company) => {
                  const hasAlerts = company.alerts.length > 0;
                  const isInactive = company.dateAnaf?.inactiv;
                  const isRadiata = !!company.dateAnaf?.data_radiere;

                  return (
                    <tr
                      key={company.id}
                      className={`hover:bg-surface-container/30 transition-colors ${
                        isInactive || isRadiata ? "bg-red-50/30" : ""
                      }`}
                    >
                      {/* Name + CUI */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isInactive || isRadiata
                                ? "bg-error"
                                : hasAlerts
                                ? "bg-amber-400"
                                : "bg-primary-container"
                            }`}
                          />
                          <div>
                            <Link
                              href={`/dashboard/companies/${company.id}`}
                              className="font-display font-semibold text-on-surface hover:text-primary-container transition-colors"
                            >
                              {company.nume}
                            </Link>
                            <p className="text-xs text-outline mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>CUI {company.cui}</span>
                              {hasAlerts && (
                                <Link
                                  href="/dashboard/alerts"
                                  className="inline-flex items-center gap-1 bg-error-container text-on-error-container font-semibold px-1.5 py-0.5 rounded-full text-xs hover:opacity-80"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 11 }}>notifications</span>
                                  {company.alerts.length}
                                </Link>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status badges */}
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {isInactive && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              INACTIVĂ
                            </span>
                          )}
                          {isRadiata && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                              RADIATĂ
                            </span>
                          )}
                          {!isInactive && !isRadiata && company.dateAnaf?.tva && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              TVA
                            </span>
                          )}
                          {!isInactive && !isRadiata && company.dateAnaf?.e_factura && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              e-Factura
                            </span>
                          )}
                          {!isInactive && !isRadiata && !company.dateAnaf?.tva && !company.dateAnaf?.e_factura && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                              Activă
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last checked */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs text-outline">
                          {company.lastChecked
                            ? new Date(company.lastChecked).toLocaleDateString("ro-RO")
                            : "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/dashboard/companies/${company.id}`}
                            className="text-xs text-primary-container font-semibold hover:opacity-75 transition-opacity flex items-center gap-1"
                          >
                            Detalii
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="text-outline hover:text-error transition-colors"
                            title="Șterge din monitorizare"
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
