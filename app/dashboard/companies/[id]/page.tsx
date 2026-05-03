"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
        {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border border-surface-variant h-32 animate-pulse" />)}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Firma nu a fost găsită</p>
        <Link href="/dashboard" className="text-primary-container text-sm hover:underline mt-2 inline-block">Înapoi la dashboard</Link>
      </div>
    );
  }

  const f = company.dateAnaf;
  const latestBilant = company.bilant?.sort((a, b) => b.an - a.an)[0];

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-sm transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        Dashboard
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24 }}>{company.nume}</h1>
          <p className="text-on-surface-variant text-sm mt-1">CUI: {company.cui}{f?.nr_reg_com && ` · ${f.nr_reg_com}`}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {f?.inactiv && <span className="bg-error-container text-on-error-container text-sm font-bold px-3 py-1 rounded-full">INACTIVĂ FISCAL</span>}
          {f?.data_radiere && <span className="bg-error-container text-on-error-container text-sm font-bold px-3 py-1 rounded-full">RADIATĂ</span>}
        </div>
      </div>

      {/* Firma data */}
      {f && (
        <div className="bg-white rounded-2xl border border-surface-variant p-6">
          <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">Date ANAF</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <DataRow label="Adresă" value={f.adresa} />
            <DataRow label="Județ" value={f.judet} />
            <DataRow label="Stare firmă" value={f.stare} />
            <DataRow label="Data înregistrare" value={f.data_inregistrare} />
            <DataRow label="Cod CAEN" value={f.cod_caen} />
            <DataRow label="Formă juridică" value={f.forma_juridica} />
            <DataRow label="Telefon" value={f.telefon} />
            <DataRow label="TVA activ" value={f.tva ? "Da" : "Nu"} colored={f.tva} />
            {f.tva_incasare && <DataRow label="TVA la încasare" value="Da" colored={false} />}
            {f.split_tva && <DataRow label="Split TVA" value="Activ" colored={false} />}
            <DataRow label="Status fiscal" value={f.inactiv ? "INACTIVĂ" : "Activă"} colored={!f.inactiv} />
            {f.data_inactivare && <DataRow label="Inactivă din" value={f.data_inactivare} />}
            <DataRow label="RO e-Factura" value={f.e_factura ? "Înregistrat" : "Neînregistrat"} colored={f.e_factura} />
            {f.e_factura_data_inregistrare && <DataRow label="e-Factura din" value={f.e_factura_data_inregistrare} />}
          </div>
          <p className="text-xs text-outline mt-5 pt-4 border-t border-surface-container">
            Sursă: ANAF oficial · Ultima verificare:{" "}
            {company.lastChecked ? new Date(company.lastChecked).toLocaleString("ro-RO") : "Niciodată"}
          </p>
        </div>
      )}

      {/* Bilanț financiar */}
      {latestBilant && (
        <div className="bg-white rounded-2xl border border-surface-variant p-6">
          <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">
            Bilanț financiar {latestBilant.an}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {latestBilant.cifra_afaceri_neta > 0 && <DataRow label="Cifră de afaceri" value={formatRON(latestBilant.cifra_afaceri_neta)} />}
            {latestBilant.profit_net !== 0 && (
              <DataRow label="Profit net" value={formatRON(latestBilant.profit_net)} colored={latestBilant.profit_net >= 0} />
            )}
            {latestBilant.pierdere_neta > 0 && <DataRow label="Pierdere netă" value={formatRON(latestBilant.pierdere_neta)} colored={false} />}
            {latestBilant.datorii > 0 && <DataRow label="Datorii totale" value={formatRON(latestBilant.datorii)} />}
            {latestBilant.capitaluri_total > 0 && <DataRow label="Capitaluri totale" value={formatRON(latestBilant.capitaluri_total)} />}
            {latestBilant.active_circulante > 0 && <DataRow label="Active circulante" value={formatRON(latestBilant.active_circulante)} />}
            {latestBilant.numar_salariati > 0 && <DataRow label="Număr salariați" value={String(latestBilant.numar_salariati)} />}
          </div>
        </div>
      )}

      {/* Alert history */}
      <div className="bg-white rounded-2xl border border-surface-variant p-6">
        <h2 className="font-display font-semibold text-on-surface mb-5 text-sm">
          Istoricul alertelor <span className="text-outline font-normal">({company.alerts.length})</span>
        </h2>
        {company.alerts.length === 0 ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-10 h-10 bg-secondary-container/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>check_circle</span>
            </div>
            <p className="text-on-surface-variant text-sm">Nicio alertă. Firma este monitorizată și toate datele sunt ok.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {company.alerts.map((alert) => (
              <div key={alert.id} className={`rounded-xl p-4 border ${alertBorderClass(alert.tipAlerta)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${alertBadgeClass(alert.tipAlerta)}`}>
                    {alert.tipAlerta}
                  </span>
                  <span className="text-xs text-outline">{new Date(alert.createdAt).toLocaleString("ro-RO")}</span>
                </div>
                {alert.detalii?.changes && (
                  <div className="space-y-1.5">
                    {alert.detalii.changes.map((c, i) => (
                      <p key={i} className="text-sm text-on-surface-variant">
                        <span className="font-medium text-on-surface">{FIELD_LABELS[c.field] || c.field}:</span>{" "}
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
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-outline font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm font-medium ${
        colored === true ? "text-primary-container" : colored === false ? "text-error" : "text-on-surface"
      }`}>
        {value}
      </p>
    </div>
  );
}
