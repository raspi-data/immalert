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

function alertRowClass(tipAlerta: string, citit: boolean) {
  if (tipAlerta === "URGENT") return "border-error/30 bg-error-container/20";
  if (tipAlerta === "IMPORTANT") return "border-tertiary/30 bg-tertiary-container/10";
  if (!citit) return "border-primary-container/30";
  return "border-surface-variant";
}

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
        <h1 className="font-display font-bold text-on-surface" style={{ fontSize: 24, lineHeight: "32px" }}>Alerte</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {unread > 0 ? (
            <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container text-xs font-semibold px-2.5 py-0.5 rounded-full">
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
            <div key={i} className="bg-white rounded-xl border border-surface-variant h-24 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-variant p-12 text-center">
          <div className="w-14 h-14 bg-secondary-container/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 28 }}>check_circle</span>
          </div>
          <p className="font-display font-semibold text-on-surface">Nicio alertă</p>
          <p className="text-on-surface-variant text-sm mt-1">Totul este în regulă cu firmele monitorizate</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-5 transition-all ${alertRowClass(alert.tipAlerta, alert.citit)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${alertBadgeClass(alert.tipAlerta)}`}>
                      {alert.tipAlerta}
                    </span>
                    {!alert.citit && (
                      <span className="w-2 h-2 bg-primary-container rounded-full" />
                    )}
                    <Link
                      href={`/dashboard/companies/${alert.company.id}`}
                      className="font-display font-semibold text-on-surface hover:text-primary-container text-sm transition-colors"
                    >
                      {alert.company.nume}
                    </Link>
                    <span className="text-outline text-xs">CUI: {alert.company.cui}</span>
                  </div>

                  {alert.detalii?.changes && (
                    <div className="space-y-1.5 mt-2">
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

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-outline">
                    {new Date(alert.createdAt).toLocaleDateString("ro-RO")}
                  </span>
                  {!alert.citit && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="text-xs text-primary-container hover:opacity-75 transition-opacity font-medium"
                    >
                      Marchează citit
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
