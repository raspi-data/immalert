"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Alert {
  id: string;
  tipAlerta: string;
  detalii: {
    changes?: { field: string; oldValue: string; newValue: string }[];
    source?: string;
  };
  citit: boolean;
  createdAt: string;
  company: { id: string; cui: string; nume: string };
}

const FIELD_LABELS: Record<string, string> = {
  scpTVA: "TVA",
  statusInactivi: "Status inactiv",
  statusEFactura: "e-Factura",
  adresa: "Adresa",
  stare_inregistrare: "Stare inregistrare",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((data) => { setAlerts(data); setLoading(false); });
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, citit: true } : a)));
  }

  const unread = alerts.filter((a) => !a.citit).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-foreground]">Alerte</h1>
        <p className="text-[--color-muted] text-sm mt-1">
          {unread > 0 ? (
            <span className="inline-flex items-center gap-1 bg-[--color-danger-bg] text-[--color-danger] text-xs font-semibold px-2 py-0.5 rounded-full">
              {unread} alerte necitite
            </span>
          ) : (
            "Toate alertele citite"
          )}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[--color-border] h-24 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[--color-border] p-12 text-center">
          <div className="w-12 h-12 bg-[--color-success-bg] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--color-success)" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[--color-foreground] font-semibold">Nicio alerta</p>
          <p className="text-[--color-muted] text-sm mt-1">Totul este in regula cu firmele monitorizate</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-5 transition-colors ${
                alert.tipAlerta === "URGENT"
                  ? "border-[--color-danger]/30 bg-[--color-danger-bg]/40"
                  : !alert.citit
                  ? "border-[--color-brand]/30"
                  : "border-[--color-border]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        alert.tipAlerta === "URGENT"
                          ? "bg-[--color-danger-bg] text-[--color-danger]"
                          : "bg-[--color-warning-bg] text-[--color-warning]"
                      }`}
                    >
                      {alert.tipAlerta}
                    </span>
                    {!alert.citit && (
                      <span className="w-2 h-2 bg-[--color-brand] rounded-full" />
                    )}
                    <Link
                      href={`/dashboard/companies/${alert.company.id}`}
                      className="font-semibold text-[--color-foreground] hover:text-[--color-brand] text-sm transition-colors"
                    >
                      {alert.company.nume}
                    </Link>
                    <span className="text-[--color-muted-light] text-xs">CUI: {alert.company.cui}</span>
                  </div>

                  {alert.detalii?.changes && (
                    <div className="space-y-1.5 mt-2">
                      {alert.detalii.changes.map((c, i) => (
                        <p key={i} className="text-sm text-[--color-muted]">
                          <span className="font-medium text-[--color-foreground]">{FIELD_LABELS[c.field] || c.field}:</span>{" "}
                          <span className="line-through text-[--color-danger]">{c.oldValue || "—"}</span>
                          {" → "}
                          <span className="text-[--color-success]">{c.newValue || "—"}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-[--color-muted-light]">
                    {new Date(alert.createdAt).toLocaleDateString("ro-RO")}
                  </span>
                  {!alert.citit && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="text-xs text-[--color-brand] hover:text-[--color-brand-dark] transition-colors"
                    >
                      Marcheaza citit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
