"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  adresa: "Adresă",
  stare_inregistrare: "Stare înregistrare",
};

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setCompany(data); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Se încarcă...</div>;
  if (!company) return <div className="text-center py-20 text-gray-500">Firma nu a fost găsită</div>;

  const anaf = company.dateAnaf;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{company.nume}</h1>
          <p className="text-gray-500 text-sm mt-1">CUI: {company.cui}</p>
        </div>
        {anaf?.statusInactivi && (
          <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">INACTIVĂ FISCAL</span>
        )}
      </div>

      {/* ANAF Data */}
      {anaf && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Date ANAF</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <DataRow label="Denumire" value={anaf.denumire} />
            <DataRow label="Adresă" value={anaf.adresa} />
            <DataRow label="Stare înregistrare" value={anaf.stare_inregistrare} />
            <DataRow label="TVA activ" value={anaf.scpTVA ? "Da" : "Nu"} colored={anaf.scpTVA} />
            <DataRow label="Status inactiv" value={anaf.statusInactivi ? "Da" : "Nu"} colored={!anaf.statusInactivi} />
            <DataRow label="e-Factura" value={anaf.statusEFactura ? "Activă" : "Inactivă"} />
            {anaf.dataInactivitate && <DataRow label="Data inactivitate" value={anaf.dataInactivitate} />}
            {anaf.dataStartEFactura && <DataRow label="Data start e-Factura" value={anaf.dataStartEFactura} />}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Ultima verificare: {company.lastChecked ? new Date(company.lastChecked).toLocaleString("ro-RO") : "Niciodată"}
          </p>
        </div>
      )}

      {/* ONRC Data */}
      {company.dateOnrc && Object.keys(company.dateOnrc).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Date ONRC</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(company.dateOnrc).map(([k, v]) => (
              <DataRow key={k} label={k} value={String(v)} />
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Istoricul alertelor ({company.alerts.length})
        </h2>
        {company.alerts.length === 0 ? (
          <p className="text-gray-400 text-sm">Nicio alertă până acum. Firma este monitorizată și toate datele sunt ok.</p>
        ) : (
          <div className="space-y-3">
            {company.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-4 border ${
                  alert.tipAlerta === "URGENT" ? "border-red-200 bg-red-50" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      alert.tipAlerta === "URGENT"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {alert.tipAlerta}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleString("ro-RO")}
                  </span>
                </div>
                {alert.detalii?.changes && (
                  <div className="space-y-1">
                    {alert.detalii.changes.map((c, i) => (
                      <p key={i} className="text-sm text-gray-700">
                        <span className="font-medium">{FIELD_LABELS[c.field] || c.field}:</span>{" "}
                        <span className="line-through text-red-500">{c.oldValue || "—"}</span>
                        {" → "}
                        <span className="text-green-600">{c.newValue || "—"}</span>
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
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-sm mt-0.5 font-medium ${colored === true ? "text-green-600" : colored === false ? "text-red-600" : "text-gray-800"}`}>
        {value || "—"}
      </p>
    </div>
  );
}
