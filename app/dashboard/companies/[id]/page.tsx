"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface AnafData {
  denumire?: string;
  adresa?: string;
  stare_inregistrare?: string;
  scpTVA?: boolean;
  statusInactivi?: boolean;
  statusEFactura?: boolean;
  dataInactivitate?: string;
  dataReactivare?: string;
  dataStartEFactura?: string;
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
  dateAnaf: AnafData | null;
  dateOnrc: Record<string, unknown> | null;
  dateBpi: Record<string, unknown> | null;
  alerts: Alert[];
}

const FIELD_LABELS: Record<string, string> = {
  scpTVA: "TVA",
  statusInactivi: "Status inactiv",
  statusEFactura: "e-Factura",
  adresa: "Adresa",
  stare_inregistrare: "Stare inregistrare",
};

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setCompany(data); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[--color-border] h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-[--color-muted]">Firma nu a fost gasita</p>
        <Link href="/dashboard" className="text-[--color-brand] text-sm hover:underline mt-2 inline-block">
          &larr; Inapoi la dashboard
        </Link>
      </div>
    );
  }

  const anaf = company.dateAnaf;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[--color-muted] hover:text-[--color-foreground] text-sm transition-colors">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[--color-foreground]">{company.nume}</h1>
          <p className="text-[--color-muted] text-sm mt-1">CUI: {company.cui}</p>
        </div>
        {anaf?.statusInactivi && (
          <span className="bg-[--color-danger-bg] text-[--color-danger] text-sm font-bold px-3 py-1 rounded-full flex-shrink-0">
            INACTIVA FISCAL
          </span>
        )}
      </div>

      {/* ANAF Data */}
      {anaf && (
        <div className="bg-white rounded-2xl border border-[--color-border] p-6">
          <h2 className="font-semibold text-[--color-foreground] mb-5 text-sm">Date ANAF</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <DataRow label="Denumire" value={anaf.denumire} />
            <DataRow label="Adresa" value={anaf.adresa} />
            <DataRow label="Stare inregistrare" value={anaf.stare_inregistrare} />
            <DataRow label="TVA activ" value={anaf.scpTVA ? "Da" : "Nu"} colored={anaf.scpTVA} />
            <DataRow label="Status inactiv" value={anaf.statusInactivi ? "Da" : "Nu"} colored={!anaf.statusInactivi} />
            <DataRow label="e-Factura" value={anaf.statusEFactura ? "Activa" : "Inactiva"} />
            {anaf.dataInactivitate && <DataRow label="Data inactivitate" value={anaf.dataInactivitate} />}
            {anaf.dataStartEFactura && <DataRow label="Data start e-Factura" value={anaf.dataStartEFactura} />}
          </div>
          <p className="text-xs text-[--color-muted-light] mt-5 pt-4 border-t border-[--color-border-light]">
            Ultima verificare:{" "}
            {company.lastChecked
              ? new Date(company.lastChecked).toLocaleString("ro-RO")
              : "Niciodata"}
          </p>
        </div>
      )}

      {/* ONRC Data */}
      {company.dateOnrc && Object.keys(company.dateOnrc).length > 0 && (
        <div className="bg-white rounded-2xl border border-[--color-border] p-6">
          <h2 className="font-semibold text-[--color-foreground] mb-5 text-sm">Date ONRC</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {Object.entries(company.dateOnrc).map(([k, v]) => (
              <DataRow key={k} label={k} value={String(v)} />
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="bg-white rounded-2xl border border-[--color-border] p-6">
        <h2 className="font-semibold text-[--color-foreground] mb-5 text-sm">
          Istoricul alertelor{" "}
          <span className="text-[--color-muted-light] font-normal">({company.alerts.length})</span>
        </h2>
        {company.alerts.length === 0 ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-8 h-8 bg-[--color-success-bg] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--color-success)" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-[--color-muted] text-sm">
              Nicio alerta pana acum. Firma este monitorizata si toate datele sunt ok.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {company.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border ${
                  alert.tipAlerta === "URGENT"
                    ? "border-[--color-danger]/30 bg-[--color-danger-bg]/40"
                    : "border-[--color-border]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      alert.tipAlerta === "URGENT"
                        ? "bg-[--color-danger-bg] text-[--color-danger]"
                        : "bg-[--color-warning-bg] text-[--color-warning]"
                    }`}
                  >
                    {alert.tipAlerta}
                  </span>
                  <span className="text-xs text-[--color-muted-light]">
                    {new Date(alert.createdAt).toLocaleString("ro-RO")}
                  </span>
                </div>
                {alert.detalii?.changes && (
                  <div className="space-y-1.5">
                    {alert.detalii.changes.map((c, i) => (
                      <p key={i} className="text-sm text-[--color-muted]">
                        <span className="font-medium text-[--color-foreground]">
                          {FIELD_LABELS[c.field] || c.field}:
                        </span>{" "}
                        <span className="line-through text-[--color-danger]">{c.oldValue || "—"}</span>
                        {" → "}
                        <span className="text-[--color-success]">{c.newValue || "—"}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DataRow({
  label,
  value,
  colored,
}: {
  label: string;
  value?: string;
  colored?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[--color-muted-light] font-medium uppercase tracking-wide mb-1">{label}</p>
      <p
        className={`text-sm font-medium ${
          colored === true
            ? "text-[--color-success]"
            : colored === false
            ? "text-[--color-danger]"
            : "text-[--color-foreground]"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
