"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface FirmaData {
  denumire?: string;
  adresa?: string;
  stare?: string;
  tva?: boolean;
  cod_caen?: string;
  denumire_caen?: string;
  administrator?: string;
  inactiv?: boolean;
  insolventa?: boolean;
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
  dateAnaf: FirmaData | null;
  alerts: Alert[];
}

const FIELD_LABELS: Record<string, string> = {
  tva: "TVA",
  inactiv: "Status inactiv",
  insolventa: "Insolvență",
  adresa: "Adresă",
  stare: "Stare firmă",
  cod_caen: "Cod CAEN",
  administrator: "Administrator",
};

function alertBadgeClass(tipAlerta: string) {
  if (tipAlerta === "URGENT") return "bg-error-container text-on-error-container";
  if (tipAlerta === "IMPORTANT") return "bg-tertiary-container text-on-tertiary-container";
  return "bg-secondary-container text-on-secondary-container";
}

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
          <div key={i} className="bg-white rounded-2xl border border-surface-variant h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Firma nu a fost găsită</p>
        <Link href="/dashboard" className="text-primary-container text-sm hover:underline mt-2 inline-block">
          Înapoi la dashboard
        </Link>
      </div>
    );
  }

  const firma = company.dateAnaf;

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-sm transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24, lineHeight: "32px" }}>{company.nume}</h1>
          <p className="text-on-surface-variant text-sm mt-1">CUI: {company.cui}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {firma?.inactiv && (
            <span className="bg-error-container text-on-error-container text-sm font-bold px-3 py-1 rounded-full flex-shrink-0">
              INACTIVĂ FISCAL
            </span>
          )}
          {firma?.insolventa && (
            <span className="bg-error-container text-on-error-container text-sm font-bold px-3 py-1 rounded-full flex-shrink-0">
              INSOLVENȚĂ
            </span>
          )}
        </div>
      </div>

      {firma && (
        <div className="bg-white rounded-2xl border border-surface-variant p-6">
          <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">Date firmă</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <DataRow label="Denumire" value={firma.denumire} />
            <DataRow label="Adresă" value={firma.adresa} />
            <DataRow label="Stare firmă" value={firma.stare} />
            <DataRow label="TVA activ" value={firma.tva ? "Da" : "Nu"} colored={firma.tva} />
            <DataRow label="Status inactiv" value={firma.inactiv ? "Da" : "Nu"} colored={!firma.inactiv} />
            <DataRow label="Insolvență" value={firma.insolventa ? "Da" : "Nu"} colored={!firma.insolventa} />
            {firma.administrator && <DataRow label="Administrator" value={firma.administrator} />}
            {firma.cod_caen && (
              <DataRow
                label="Cod CAEN"
                value={firma.denumire_caen ? `${firma.cod_caen} — ${firma.denumire_caen}` : firma.cod_caen}
              />
            )}
          </div>
          <p className="text-xs text-outline mt-5 pt-4 border-t border-surface-container">
            Ultima verificare:{" "}
            {company.lastChecked
              ? new Date(company.lastChecked).toLocaleString("ro-RO")
              : "Niciodată"}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-surface-variant p-6">
        <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">
          Istoricul alertelor{" "}
          <span className="text-outline font-normal">({company.alerts.length})</span>
        </h2>
        {company.alerts.length === 0 ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-secondary-container/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>check_circle</span>
            </div>
            <p className="text-on-surface-variant text-sm">
              Nicio alertă până acum. Firma este monitorizată și toate datele sunt ok.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {company.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border ${
                  alert.tipAlerta === "URGENT"
                    ? "border-error/30 bg-error-container/20"
                    : alert.tipAlerta === "IMPORTANT"
                    ? "border-tertiary/30 bg-tertiary-container/10"
                    : "border-surface-variant"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${alertBadgeClass(alert.tipAlerta)}`}>
                    {alert.tipAlerta}
                  </span>
                  <span className="text-xs text-outline">
                    {new Date(alert.createdAt).toLocaleString("ro-RO")}
                  </span>
                </div>
                {alert.detalii?.changes && (
                  <div className="space-y-1.5">
                    {alert.detalii.changes.map((c, i) => (
                      <p key={i} className="text-sm text-on-surface-variant">
                        <span className="font-medium text-on-surface">
                          {FIELD_LABELS[c.field] || c.field}:
                        </span>{" "}
                        <span className="line-through text-error">{c.oldValue || "—"}</span>
                        {" → "}
                        <span className="text-primary-container font-medium">{c.newValue || "—"}</span>
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

function DataRow({ label, value, colored }: { label: string; value?: string; colored?: boolean }) {
  return (
    <div>
      <p className="text-xs text-outline font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm font-medium ${
        colored === true ? "text-primary-container" : colored === false ? "text-error" : "text-on-surface"
      }`}>
        {value || "—"}
      </p>
    </div>
  );
}
