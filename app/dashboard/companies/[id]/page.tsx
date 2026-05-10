"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { BilantAnual } from "@/lib/anaf";

interface StoredFirma {
  denumire?: string;
  adresa?: string;
  stare?: string;
  tva?: boolean;
  tva_incasare?: boolean;
  split_tva?: boolean;
  e_factura?: boolean;
  e_factura_data_inregistrare?: string;
  cod_caen?: string;
  nr_reg_com?: string;
  data_inregistrare?: string;
  forma_juridica?: string;
  organ_fiscal?: string;
  telefon?: string;
  inactiv?: boolean;
  data_inactivare?: string;
  data_radiere?: string;
  judet?: string;
}

interface Alert {
  id: string;
  tipAlerta: string;
  detalii: {
    changes?: { field: string; oldValue: string; newValue: string }[];
    source?: string;
  };
  citit: boolean;
  createdAt: string;
}

interface Company {
  id: string;
  cui: string;
  nume: string;
  lastChecked: string | null;
  dateAnaf: StoredFirma | null;
  alerts: Alert[];
  bilant?: BilantAnual[];
}

const FIELD_LABELS: Record<string, string> = {
  tva: "TVA",
  inactiv: "Status inactiv",
  data_radiere: "Radiere firmă",
  adresa: "Adresă",
  stare: "Stare firmă",
  cod_caen: "Cod CAEN",
  e_factura: "RO e-Factura",
  tva_incasare: "TVA la încasare",
  split_tva: "Split TVA",
};

function alertBorderClass(tip: string) {
  if (tip === "CRITIC") return "border-error/30 bg-error-container/20";
  if (tip === "IMPORTANT") return "border-tertiary/30 bg-tertiary-container/10";
  return "border-surface-variant";
}
function alertBadgeClass(tip: string) {
  if (tip === "CRITIC") return "bg-error-container text-on-error-container";
  if (tip === "IMPORTANT") return "bg-tertiary-container text-on-tertiary-container";
  return "bg-secondary-container text-on-secondary-container";
}

function formatRON(v: number) {
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON", maximumFractionDigits: 0 }).format(v);
}

type TabId = "generale" | "fiscale" | "financiare" | "alerte";

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("generale");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setCompany(data); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!confirm("Ștergi firma din monitorizare?")) return;
    setDeleting(true);
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-surface-variant h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Firma nu a fost găsită</p>
        <Link href="/dashboard" className="text-primary text-sm hover:underline mt-2 inline-block">
          Înapoi la dashboard
        </Link>
      </div>
    );
  }

  const f = company.dateAnaf;
  const bilanturi = [...(company.bilant ?? [])].sort((a, b) => b.an - a.an);

  const isInactiva = !!f?.inactiv;
  const isRadiata = !!f?.data_radiere;
  const statusLabel = isRadiata ? "RADIATĂ" : isInactiva ? "INACTIVĂ" : "ACTIVĂ";
  const statusIsOk = !isInactiva && !isRadiata;

  const initials = company.nume
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const tabs: { id: TabId; label: string }[] = [
    { id: "generale", label: "Date Generale" },
    { id: "fiscale", label: "Date Fiscale" },
    { id: "financiare", label: "Date Financiare" },
    { id: "alerte", label: "Alerte" },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header card ── */}
      <div className="bg-white rounded-2xl border border-surface-variant p-6">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant border border-surface-variant rounded-lg px-3 py-1.5 hover:bg-surface-container hover:text-on-surface transition-all duration-200"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Dashboard
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-error text-on-error px-3 py-1.5 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
            {deleting ? "Se șterge…" : "Șterge din monitorizare"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 font-bold"
            style={{ background: "#a8e6cf", color: "#2c6956", fontSize: 18 }}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24 }}>
                {company.nume}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  statusIsOk
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-error-container text-on-error-container"
                }`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-outline mt-0.5">
              CUI {company.cui}
              {f?.nr_reg_com && ` · ${f.nr_reg_com}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-surface-variant">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px inline-flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-outline hover:text-on-surface"
            }`}
          >
            {tab.label}
            {tab.id === "alerte" && company.alerts.length > 0 && (
              <span className="text-[10px] font-bold bg-error text-on-error px-1.5 py-0.5 rounded-full leading-none">
                {company.alerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Date Generale ── */}
      {activeTab === "generale" && (
        <div className="space-y-5">
          {f ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiMini
                  icon="receipt_long"
                  label={f.tva ? "Plătitor TVA" : "Neplătitor TVA"}
                  positive={!!f.tva}
                />
                <KpiMini
                  icon="shield"
                  label={f.inactiv ? "INACTIVĂ" : "Activă"}
                  positive={!f.inactiv}
                />
                <KpiMini
                  icon="description"
                  label={f.e_factura ? "Înregistrat e-Factura" : "Neînregistrat e-Factura"}
                  positive={f.e_factura ? true : undefined}
                  neutral={!f.e_factura}
                />
                <KpiMini
                  icon="schedule"
                  label={
                    company.lastChecked
                      ? new Date(company.lastChecked).toLocaleDateString("ro-RO")
                      : "Neverificat"
                  }
                  neutral
                />
              </div>

              <div className="bg-white rounded-2xl border border-surface-variant p-6">
                <h2 className="font-display font-semibold text-on-surface text-sm mb-4">Date generale</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <DataRow label="Adresă" value={f.adresa} />
                  <DataRow label="Județ" value={f.judet} />
                  <DataRow label="Stare firmă" value={f.stare} />
                  <DataRow label="Data înregistrare" value={f.data_inregistrare} />
                  <DataRow label="Cod CAEN" value={f.cod_caen} />
                  <DataRow label="Formă juridică" value={f.forma_juridica} />
                  <DataRow label="Telefon" value={f.telefon} />
                </div>
                <p className="text-xs text-outline mt-5 pt-4 border-t border-surface-container">
                  Sursă: ANAF oficial · Ultima verificare:{" "}
                  {company.lastChecked
                    ? new Date(company.lastChecked).toLocaleString("ro-RO")
                    : "Niciodată"}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-surface-variant p-10 text-center">
              <p className="text-on-surface-variant text-sm">Nu există date ANAF disponibile.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Date Fiscale ── */}
      {activeTab === "fiscale" && (
        <div className="bg-white rounded-2xl border border-surface-variant p-6">
          <h2 className="font-display font-semibold text-on-surface text-sm mb-4">Date fiscale</h2>
          {f ? (
            <div className="grid sm:grid-cols-2 gap-4">
              <DataRow label="TVA activ" value={f.tva ? "Da" : "Nu"} colored={f.tva} />
              {f.tva_incasare && <DataRow label="TVA la încasare" value="Da" />}
              {f.split_tva && <DataRow label="Split TVA" value="Activ" />}
              <DataRow
                label="Status fiscal"
                value={f.inactiv ? "INACTIVĂ" : "Activă"}
                colored={!f.inactiv}
              />
              {f.data_inactivare && <DataRow label="Inactivă din" value={f.data_inactivare} />}
              <DataRow
                label="RO e-Factura"
                value={f.e_factura ? "Înregistrat" : "Neînregistrat"}
                colored={f.e_factura}
              />
              {f.e_factura_data_inregistrare && (
                <DataRow label="e-Factura din" value={f.e_factura_data_inregistrare} />
              )}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">Nu există date fiscale disponibile.</p>
          )}
        </div>
      )}

      {/* ── Tab: Date Financiare ── */}
      {activeTab === "financiare" && (
        <div className="space-y-5">
          {bilanturi.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-variant p-16 text-center">
              <span
                className="material-symbols-outlined text-outline"
                style={{ fontSize: 40 }}
              >
                bar_chart
              </span>
              <p className="text-on-surface-variant text-sm mt-3">
                Nu există date financiare disponibile pentru această firmă.
              </p>
            </div>
          ) : (
            bilanturi.map((b) => (
              <div key={b.an} className="bg-white rounded-2xl border border-surface-variant p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>
                    query_stats
                  </span>
                  <h3 className="font-display font-semibold text-on-surface text-sm">
                    Exercițiu financiar {b.an}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <FinKpi
                    icon="trending_up"
                    label="Cifră afaceri netă"
                    value={b.cifra_afaceri_neta > 0 ? formatRON(b.cifra_afaceri_neta) : "—"}
                    color="green"
                  />
                  <FinKpi
                    icon="account_balance"
                    label="Profit net"
                    value={b.profit_net !== 0 ? formatRON(b.profit_net) : "—"}
                    color={b.profit_net > 0 ? "green" : b.profit_net < 0 ? "red" : "gray"}
                  />
                  <FinKpi
                    icon="credit_card"
                    label="Total datorii"
                    value={b.datorii > 0 ? formatRON(b.datorii) : "—"}
                    color="orange"
                  />
                  <FinKpi
                    icon="group"
                    label="Număr salariați"
                    value={b.numar_salariati > 0 ? String(b.numar_salariati) : "—"}
                    color="blue"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {b.venituri_totale > 0 && (
                    <DataRow label="Total venituri" value={formatRON(b.venituri_totale)} />
                  )}
                  {b.cheltuieli_totale > 0 && (
                    <DataRow label="Total cheltuieli" value={formatRON(b.cheltuieli_totale)} />
                  )}
                  {b.pierdere_neta > 0 && (
                    <DataRow label="Pierdere netă" value={formatRON(b.pierdere_neta)} colored={false} />
                  )}
                  {b.active_imobilizate > 0 && (
                    <DataRow label="Active imobilizate" value={formatRON(b.active_imobilizate)} />
                  )}
                  {b.active_circulante > 0 && (
                    <DataRow label="Active circulante" value={formatRON(b.active_circulante)} />
                  )}
                  {b.stocuri > 0 && (
                    <DataRow label="Stocuri" value={formatRON(b.stocuri)} />
                  )}
                  {b.creante > 0 && (
                    <DataRow label="Creanțe" value={formatRON(b.creante)} />
                  )}
                  {b.casa_si_conturi_banci > 0 && (
                    <DataRow label="Casa și conturi bănci" value={formatRON(b.casa_si_conturi_banci)} />
                  )}
                  {b.capitaluri_total > 0 && (
                    <DataRow label="Capitaluri proprii" value={formatRON(b.capitaluri_total)} />
                  )}
                  {b.capital_subscris_varsat > 0 && (
                    <DataRow label="Capital subscris vărsat" value={formatRON(b.capital_subscris_varsat)} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Alerte ── */}
      {activeTab === "alerte" && (
        <div className="bg-white rounded-2xl border border-surface-variant overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-variant">
            <h2 className="font-display font-semibold text-on-surface text-sm">
              Istoricul alertelor{" "}
              <span className="text-outline font-normal">({company.alerts.length})</span>
            </h2>
          </div>

          {company.alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-green-600"
                  style={{ fontSize: 24, fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <p className="text-on-surface-variant text-sm">Nicio alertă. Toate datele sunt ok.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container/50 border-b border-surface-variant">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                    Data
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Modificare
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {company.alerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-surface-container/30 transition-colors duration-150"
                  >
                    <td className="px-5 py-3.5 text-xs text-outline whitespace-nowrap">
                      {new Date(alert.createdAt).toLocaleString("ro-RO")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${alertBadgeClass(alert.tipAlerta)}`}
                      >
                        {alert.tipAlerta}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {alert.detalii?.changes ? (
                        <div className="space-y-1">
                          {alert.detalii.changes.map((c, i) => (
                            <p key={i} className="text-xs text-on-surface-variant">
                              <span className="font-medium text-on-surface">
                                {FIELD_LABELS[c.field] || c.field}:
                              </span>{" "}
                              <span className="line-through text-error">{c.oldValue || "—"}</span>
                              {" → "}
                              <span className="text-primary font-medium">{c.newValue || "—"}</span>
                            </p>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-outline">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function KpiMini({
  icon,
  label,
  positive,
  neutral,
}: {
  icon: string;
  label: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  const c = neutral
    ? { bg: "bg-surface-container", iconCls: "text-outline", textCls: "text-on-surface-variant" }
    : positive
    ? { bg: "bg-green-50", iconCls: "text-green-600", textCls: "text-green-700" }
    : { bg: "bg-error-container/40", iconCls: "text-error", textCls: "text-error" };

  return (
    <div className={`rounded-xl border border-surface-variant p-4 flex flex-col gap-2 ${c.bg}`}>
      <span
        className={`material-symbols-outlined ${c.iconCls}`}
        style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <p className={`text-xs font-semibold leading-tight ${c.textCls}`}>{label}</p>
    </div>
  );
}

function FinKpi({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: "green" | "red" | "orange" | "blue" | "gray";
}) {
  const styles = {
    green: { wrap: "bg-green-50 border-green-100", iconCls: "text-green-600", valCls: "text-green-700" },
    red: { wrap: "bg-error-container/40 border-error/20", iconCls: "text-error", valCls: "text-on-error-container" },
    orange: { wrap: "bg-tertiary-container/50 border-tertiary/20", iconCls: "text-tertiary", valCls: "text-on-tertiary-container" },
    blue: { wrap: "bg-blue-50 border-blue-100", iconCls: "text-blue-600", valCls: "text-blue-700" },
    gray: { wrap: "bg-surface-container border-surface-variant", iconCls: "text-outline", valCls: "text-on-surface-variant" },
  };
  const s = styles[color];

  return (
    <div className={`rounded-xl border p-4 ${s.wrap}`}>
      <span
        className={`material-symbols-outlined ${s.iconCls}`}
        style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <p className="text-[11px] text-on-surface-variant mt-2 mb-1 leading-tight">{label}</p>
      <p className={`text-sm font-bold ${s.valCls}`}>{value}</p>
    </div>
  );
}

function DataRow({ label, value, colored }: { label: string; value?: string; colored?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-outline font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p
        className={`text-sm font-medium ${
          colored === true ? "text-primary" : colored === false ? "text-error" : "text-on-surface"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
