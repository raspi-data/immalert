"use client";

import type { AnafCompanyData } from "@/lib/anaf";

interface Props {
  company: AnafCompanyData;
  email: string;
  onReset: () => void;
}

function StatusBadge({ ok, labelOk, labelNot }: { ok: boolean; labelOk: string; labelNot: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
      {labelOk}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold">
      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>cancel</span>
      {labelNot}
    </span>
  );
}

function Row({ label, value, icon }: { label: string; value: React.ReactNode; icon: string }) {
  return (
    <tr className="border-b border-surface-variant last:border-0 hover:bg-surface-container/40 transition-colors">
      <td className="py-3.5 px-5 w-[45%]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-outline flex-shrink-0" style={{ fontSize: 18 }}>{icon}</span>
          <span className="text-sm text-on-surface-variant font-medium">{label}</span>
        </div>
      </td>
      <td className="py-3.5 px-5">
        <span className="text-sm text-on-surface font-semibold">{value || "—"}</span>
      </td>
    </tr>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <tr className="bg-surface-container border-b border-surface-variant">
      <td colSpan={2} className="px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 16 }}>{icon}</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{title}</span>
        </div>
      </td>
    </tr>
  );
}

export default function CompanyResultTable({ company, email, onReset }: Props) {
  const formatDate = (d?: string) => {
    if (!d) return null;
    if (d === "0000-00-00" || d === "") return null;
    return d;
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      {/* Header card */}
      <div className="bg-white border border-surface-variant rounded-3xl overflow-hidden shadow-sm">
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-surface-variant bg-surface-container/50">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>apartment</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-on-surface text-lg leading-tight">{company.denumire}</h2>
              <p className="text-sm text-outline mt-0.5">CUI {company.cui} &nbsp;·&nbsp; Interogat pe {new Date().toLocaleDateString("ro-RO")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-surface-variant">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 14 }}>mark_email_read</span>
              Raport trimis la {email}
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary-container hover:bg-surface-container px-3 py-1.5 rounded-full border border-primary-container/30 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>refresh</span>
              Alta firma
            </button>
          </div>
        </div>

        {/* Quick status pills */}
        <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-surface-variant bg-white">
          <StatusBadge ok={company.scpTVA} labelOk="Platitor TVA" labelNot="Neplatitor TVA" />
          <StatusBadge ok={!company.statusInactivi} labelOk="Activa fiscal" labelNot="Inactiva fiscal" />
          <StatusBadge ok={company.statusEFactura} labelOk="Inregistrata e-Factura" labelNot="Neinregistrata e-Factura" />
          {company.stare_inregistrare && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
              {company.stare_inregistrare}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>

              {/* Date generale */}
              <SectionHeader title="Date generale" icon="business" />
              <Row icon="badge" label="Denumire" value={company.denumire} />
              <Row icon="tag" label="CUI" value={company.cui} />
              <Row icon="location_on" label="Adresa" value={company.adresa} />
              <Row icon="info" label="Stare inregistrare" value={company.stare_inregistrare} />

              {/* TVA */}
              <SectionHeader title="Inregistrare TVA" icon="receipt_long" />
              <Row
                icon="receipt_long"
                label="Platitor TVA"
                value={<StatusBadge ok={company.scpTVA} labelOk="Da" labelNot="Nu" />}
              />
              {formatDate(company.dataInactivitate) && (
                <Row icon="event" label="Data inactivitate TVA" value={formatDate(company.dataInactivitate)} />
              )}
              {formatDate(company.dataReactivare) && (
                <Row icon="event" label="Data reactivare TVA" value={formatDate(company.dataReactivare)} />
              )}
              {formatDate(company.dataPublicare) && (
                <Row icon="event" label="Data publicare TVA" value={formatDate(company.dataPublicare)} />
              )}
              {formatDate(company.dataAnulare) && (
                <Row icon="event" label="Data anulare TVA" value={formatDate(company.dataAnulare)} />
              )}
              {company.mesaj && (
                <Row icon="comment" label="Mesaj ANAF" value={company.mesaj} />
              )}

              {/* Inactivitate fiscala */}
              <SectionHeader title="Inactivitate fiscala (RTVAI)" icon="block" />
              <Row
                icon="block"
                label="Status inactivitate"
                value={<StatusBadge ok={!company.statusInactivi} labelOk="Activa" labelNot="Inactiva" />}
              />
              {formatDate(company.dataInceputInactivitate) && (
                <Row icon="event" label="Data inceput inactivitate" value={formatDate(company.dataInceputInactivitate)} />
              )}
              {formatDate(company.dataAnulareInactivitate) && (
                <Row icon="event" label="Data anulare inactivitate" value={formatDate(company.dataAnulareInactivitate)} />
              )}
              {formatDate(company.dataPublicareInactivitate) && (
                <Row icon="event" label="Data publicare inactivitate" value={formatDate(company.dataPublicareInactivitate)} />
              )}

              {/* e-Factura */}
              <SectionHeader title="e-Factura RO" icon="description" />
              <Row
                icon="description"
                label="Inregistrata e-Factura"
                value={<StatusBadge ok={company.statusEFactura} labelOk="Da" labelNot="Nu" />}
              />
              {formatDate(company.dataStartEFactura) && (
                <Row icon="event" label="Data start e-Factura" value={formatDate(company.dataStartEFactura)} />
              )}
              {formatDate(company.dataAnulareEFactura) && (
                <Row icon="event" label="Data anulare e-Factura" value={formatDate(company.dataAnulareEFactura)} />
              )}

            </tbody>
          </table>
        </div>

        {/* CTA footer */}
        <div className="px-6 py-5 bg-surface-container/30 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-on-surface text-sm">Vrei sa monitorizezi aceasta firma continuu?</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Primesti alerte automate pe email la orice schimbare.</p>
          </div>
          <a
            href="/register"
            className="flex-shrink-0 bg-primary-container text-white px-6 py-2.5 rounded-xl font-display font-semibold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications_active</span>
            Incepe Trial Gratuit 14 Zile
          </a>
        </div>
      </div>
    </section>
  );
}
