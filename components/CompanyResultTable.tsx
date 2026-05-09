"use client";

import type { FirmaData, BilantAnual } from "@/lib/anaf";

const fmt = (n: number) => new Intl.NumberFormat("ro-RO").format(n) + " RON";

interface Props {
  company: FirmaData;
  email: string;
  bilanturi: BilantAnual[];
  onReset: () => void;
}

function Badge({ ok, labelOk, labelNot }: { ok: boolean; labelOk: string; labelNot: string }) {
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

function Row({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  if (!value || value === "") return null;
  return (
    <tr className="border-b border-surface-variant last:border-0 hover:bg-surface-container/40 transition-colors">
      <td className="py-3.5 px-5 w-[45%]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-outline flex-shrink-0" style={{ fontSize: 18 }}>{icon}</span>
          <span className="text-sm text-on-surface-variant font-medium">{label}</span>
        </div>
      </td>
      <td className="py-3.5 px-5">
        <span className="text-sm text-on-surface font-semibold">{value}</span>
      </td>
    </tr>
  );
}

function Section({ title, icon }: { title: string; icon: string }) {
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

export default function CompanyResultTable({ company, email, bilanturi, onReset }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
      <div className="bg-white border border-surface-variant rounded-3xl overflow-hidden shadow-sm">

        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-surface-variant bg-surface-container/50">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>apartment</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-on-surface text-lg leading-tight">{company.denumire}</h2>
              <p className="text-sm text-outline mt-0.5">
                CUI {company.cui}
                {company.nr_reg_com && <> &nbsp;·&nbsp; {company.nr_reg_com}</>}
                &nbsp;·&nbsp; Interogat pe {new Date().toLocaleDateString("ro-RO")}
              </p>
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
              Altă firmă
            </button>
          </div>
        </div>

        {/* Quick status pills */}
        <div className="flex flex-wrap gap-3 px-6 py-4 border-b border-surface-variant bg-white">
          <Badge ok={company.tva} labelOk="Plătitor TVA" labelNot="Neplătitor TVA" />
          <Badge ok={!company.inactiv} labelOk="Activă fiscal" labelNot="INACTIVĂ fiscal" />
          <Badge ok={company.e_factura} labelOk="e-Factura activ" labelNot="Fără e-Factura" />
          {company.tva_incasare && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>payments</span>
              TVA la încasare
            </span>
          )}
          {company.data_radiere && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
              RADIATĂ {company.data_radiere}
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>

              <Section title="Date generale" icon="business" />
              <Row icon="badge" label="Denumire" value={company.denumire} />
              <Row icon="tag" label="CUI" value={company.cui} />
              <Row icon="article" label="Nr. Reg. Com." value={company.nr_reg_com} />
              <Row icon="location_on" label="Adresă" value={company.adresa} />
              <Row icon="map" label="Județ" value={company.judet} />
              <Row icon="info" label="Stare firmă" value={company.stare} />
              <Row icon="category" label="Cod CAEN" value={company.cod_caen} />
              <Row icon="calendar_today" label="Data înregistrare" value={company.data_inregistrare} />
              <Row icon="phone" label="Telefon" value={company.telefon} />
              <Row icon="gavel" label="Formă juridică" value={company.forma_juridica} />

              <Section title="Status fiscal" icon="receipt_long" />
              <Row icon="receipt_long" label="Plătitor TVA"
                value={<Badge ok={company.tva} labelOk="Da" labelNot="Nu" />} />
              {company.tva && company.tva_data_inceput && (
                <Row icon="event" label="TVA din" value={company.tva_data_inceput} />
              )}
              <Row icon="block" label="Inactivitate fiscală"
                value={<Badge ok={!company.inactiv} labelOk="Activă" labelNot="INACTIVĂ" />} />
              {company.inactiv && company.data_inactivare && (
                <Row icon="event" label="Inactivă din" value={company.data_inactivare} />
              )}
              <Row icon="payments" label="TVA la încasare"
                value={<Badge ok={!company.tva_incasare} labelOk="Nu" labelNot="Da — aplică TVA la încasare" />} />
              <Row icon="swap_horiz" label="Split TVA"
                value={<Badge ok={!company.split_tva} labelOk="Nu" labelNot="Da — split TVA activ" />} />

              <Section title="RO e-Factura" icon="description" />
              <Row icon="description" label="Înregistrat e-Factura"
                value={<Badge ok={company.e_factura} labelOk="Da" labelNot="Nu" />} />
              {company.e_factura && company.e_factura_data_inregistrare && (
                <Row icon="event" label="Înregistrat din" value={company.e_factura_data_inregistrare} />
              )}

              <Section title="Date financiare" icon="query_stats" />
              {bilanturi.length === 0 ? (
                <Row icon="info" label="Date financiare" value="Nu există date disponibile" />
              ) : (
                bilanturi.map((b) => (
                  <>
                    <tr key={`${b.an}-header`} className="border-b border-surface-variant bg-surface-container/30">
                      <td colSpan={2} className="px-5 py-2 text-xs font-bold text-on-surface-variant">
                        Exercițiu financiar {b.an}
                      </td>
                    </tr>
                    {b.cifra_afaceri_neta > 0 && <Row key={`${b.an}-ca`} icon="trending_up" label="Cifră afaceri netă" value={fmt(b.cifra_afaceri_neta)} />}
                    {b.venituri_totale > 0 && <Row key={`${b.an}-vt`} icon="payments" label="Total venituri" value={fmt(b.venituri_totale)} />}
                    {b.cheltuieli_totale > 0 && <Row key={`${b.an}-ct`} icon="receipt" label="Total cheltuieli" value={fmt(b.cheltuieli_totale)} />}
                    {b.profit_net !== 0 && (
                      <Row key={`${b.an}-pn`} icon="account_balance" label="Profit net"
                        value={<span className={b.profit_net > 0 ? "text-green-700" : "text-red-700"}>{fmt(b.profit_net)}</span>}
                      />
                    )}
                    {b.pierdere_neta > 0 && (
                      <Row key={`${b.an}-prd`} icon="trending_down" label="Pierdere netă"
                        value={<span className="text-red-700">{fmt(b.pierdere_neta)}</span>}
                      />
                    )}
                    {b.active_imobilizate > 0 && <Row key={`${b.an}-ai`} icon="apartment" label="Active imobilizate" value={fmt(b.active_imobilizate)} />}
                    {b.active_circulante > 0 && <Row key={`${b.an}-ac`} icon="inventory_2" label="Active circulante" value={fmt(b.active_circulante)} />}
                    {b.stocuri > 0 && <Row key={`${b.an}-st`} icon="inventory" label="Stocuri" value={fmt(b.stocuri)} />}
                    {b.creante > 0 && <Row key={`${b.an}-cr`} icon="handshake" label="Creanțe" value={fmt(b.creante)} />}
                    {b.casa_si_conturi_banci > 0 && <Row key={`${b.an}-cb`} icon="savings" label="Casa și conturi bănci" value={fmt(b.casa_si_conturi_banci)} />}
                    {b.capitaluri_total > 0 && <Row key={`${b.an}-cap`} icon="pie_chart" label="Capitaluri proprii" value={fmt(b.capitaluri_total)} />}
                    {b.datorii > 0 && <Row key={`${b.an}-dat`} icon="credit_card" label="Total datorii" value={fmt(b.datorii)} />}
                    {b.capital_subscris_varsat > 0 && <Row key={`${b.an}-csv`} icon="business_center" label="Capital subscris vărsat" value={fmt(b.capital_subscris_varsat)} />}
                    {b.numar_salariati > 0 && <Row key={`${b.an}-sal`} icon="group" label="Număr salariați" value={String(b.numar_salariati)} />}
                  </>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* Source note */}
        <div className="px-6 py-3 border-t border-surface-variant bg-surface-container/20">
          <p className="text-xs text-outline flex items-center gap-1.5">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
            Date oficiale din ANAF (fiscal) și Ministerul Finanțelor (bilanț)
          </p>
        </div>

        {/* CTA footer */}
        <div className="px-6 py-5 bg-surface-container/30 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-on-surface text-sm">Vrei să monitorizezi această firmă continuu?</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Primești alerte automate pe email la orice schimbare ANAF.</p>
          </div>
          <a
            href="/register"
            className="flex-shrink-0 bg-primary-container text-white px-6 py-2.5 rounded-xl font-display font-semibold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>notifications_active</span>
            Începe Trial Gratuit 14 Zile
          </a>
        </div>
      </div>
    </section>
  );
}
