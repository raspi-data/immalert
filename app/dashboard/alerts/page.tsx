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
  adresa: "Adresă",
  stare_inregistrare: "Stare înregistrare",
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
        <h1 className="text-2xl font-bold text-gray-900">Alerte</h1>
        <p className="text-gray-500 text-sm mt-1">
          {unread > 0 ? `${unread} alerte necitite` : "Toate alertele citite"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-900 font-semibold">Nicio alertă</p>
          <p className="text-gray-500 text-sm mt-1">Totul este în regulă cu firmele monitorizate</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl border p-5 transition-colors ${
                !alert.citit ? "border-blue-200" : "border-gray-100"
              } ${alert.tipAlerta === "URGENT" ? "border-red-200 bg-red-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        alert.tipAlerta === "URGENT"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {alert.tipAlerta}
                    </span>
                    {!alert.citit && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <Link
                      href={`/dashboard/companies/${alert.company.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-700 text-sm"
                    >
                      {alert.company.nume}
                    </Link>
                    <span className="text-gray-400 text-xs">CUI: {alert.company.cui}</span>
                  </div>

                  {alert.detalii?.changes && (
                    <div className="mt-2 space-y-1">
                      {alert.detalii.changes.map((c, i) => (
                        <p key={i} className="text-sm text-gray-600">
                          <span className="font-medium">{FIELD_LABELS[c.field] || c.field}:</span>{" "}
                          <span className="line-through text-red-500">{c.oldValue || "—"}</span>
                          {" → "}
                          <span className="text-green-600">{c.newValue || "—"}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleDateString("ro-RO")}
                  </span>
                  {!alert.citit && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
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
