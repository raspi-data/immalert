import { Resend } from "resend";
import type { FirmaData } from "./anaf";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "ImmAlert <noreply@immalert.ro>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://immalert.ro";

function badge(text: string, bg: string, color: string) {
  return `<span style="background:${bg};color:${color};padding:2px 10px;border-radius:99px;font-size:13px;font-weight:600;">${text}</span>`;
}

function tvaBadge(isTva: boolean) {
  return isTva
    ? badge("Plătitor TVA", "#dcfce7", "#16a34a")
    : badge("Neplătitor TVA", "#fee2e2", "#dc2626");
}

function statusBadge(isActive: boolean) {
  return isActive
    ? badge("Activă", "#dcfce7", "#16a34a")
    : badge("Inactiv fiscal", "#fee2e2", "#dc2626");
}

function efactBadge(registered: boolean) {
  return registered
    ? badge("Înregistrat e-Factura", "#dcfce7", "#16a34a")
    : badge("Neînregistrat e-Factura", "#fef3c7", "#d97706");
}

function emailShell(subtitle: string, body: string) {
  return `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f9fafb;">
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:24px 16px;">

  <div style="background:#ffffff;padding:20px 32px 16px;border-radius:12px 12px 0 0;border:1px solid #e5e7eb;border-bottom:none;">
    <p style="margin:0;font-size:24px;font-weight:700;color:#16a34a;letter-spacing:-0.5px;">ImmAlert</p>
    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${subtitle}</p>
  </div>

  <div style="background:#ffffff;padding:28px 32px 32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
    ${body}
  </div>

  <div style="padding:20px 0;text-align:center;border-top:1px solid #e5e7eb;margin-top:4px;background:#f9fafb;">
    <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">Datele sunt preluate din surse oficiale publice: ANAF (anaf.ro) — actualizate zilnic.</p>
    <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">ImmAlert — Monitorizare firme Romania</p>
    <p style="color:#9ca3af;font-size:12px;margin:0;">Acest email a fost trimis automat. Nu răspundeți la acest email.</p>
  </div>

</div>
</body></html>`;
}

export async function sendWelcomeEmail(email: string, name?: string | null) {
  const resend = getResend();
  const body = `
    <h2 style="color:#111827;margin:0 0 12px;font-size:20px;">Bun venit${name ? `, ${name}` : ""}!</h2>
    <p style="color:#374151;margin:0 0 16px;font-size:14px;line-height:1.6;">
      Contul tău a fost creat cu succes. Poți monitoriza orice firmă din România, <strong>complet gratuit</strong>.
    </p>
    <h3 style="color:#111827;font-size:14px;font-weight:600;margin:0 0 10px;">Ce poți face acum:</h3>
    <ul style="color:#374151;margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;">
      <li>Adaugă firme după CUI</li>
      <li>Primești alerte instant când se schimbă ceva</li>
      <li>Monitorizezi TVA, insolvență, administrator, sediu și multe altele</li>
    </ul>
    <div style="margin-bottom:24px;padding:16px 20px;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a;">
      <p style="margin:0;color:#111827;font-size:14px;line-height:1.6;">
        Serviciul este <strong>100% gratuit</strong> — fără card, fără trial, fără limite.
      </p>
    </div>
    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Accesează Dashboard-ul →
    </a>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bun venit la ImmAlert — Monitorizare firme 100% gratuit!",
    html: emailShell("Bun venit la ImmAlert", body),
  });
}

export async function sendCompanyAddedEmail(email: string, companyName: string, cui: string, companyId: string) {
  const resend = getResend();
  const body = `
    <h2 style="color:#111827;margin:0 0 6px;font-size:18px;">Firmă adăugată la monitorizare</h2>
    <p style="color:#6b7280;margin:0 0 20px;font-size:13px;">Adăugată pe ${new Date().toLocaleDateString("ro-RO")}</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <tbody>
        <tr style="background:#ffffff;">
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%;">Denumire</td>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${companyName}</td>
        </tr>
        <tr style="background:#f9fafb;">
          <td style="padding:10px 16px;color:#6b7280;font-size:14px;">CUI</td>
          <td style="padding:10px 16px;color:#111827;font-size:14px;font-weight:500;">${cui}</td>
        </tr>
      </tbody>
    </table>
    <div style="padding:16px 20px;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a;margin-bottom:24px;">
      <p style="margin:0;color:#111827;font-size:14px;line-height:1.6;">
        Monitorizarea acestei firme este activă în contul tău ImmAlert. Vei primi o alertă pe email de fiecare dată când se schimbă ceva.
      </p>
    </div>
    <a href="${APP_URL}/dashboard/companies/${companyId}" style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Vezi firma în dashboard →
    </a>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `ImmAlert — ${companyName} a fost adăugată la monitorizare`,
    html: emailShell("Confirmare monitorizare firmă", body),
  });
}

export async function sendPasswordChangedEmail(email: string) {
  const resend = getResend();
  const body = `
    <h2 style="color:#111827;margin:0 0 12px;font-size:20px;">Parola ta a fost schimbată</h2>
    <p style="color:#374151;margin:0 0 16px;font-size:14px;line-height:1.6;">
      Parola contului tău ImmAlert asociat adresei <strong>${email}</strong> a fost modificată cu succes pe <strong>${new Date().toLocaleDateString("ro-RO")}</strong>.
    </p>
    <div style="padding:16px 20px;background:#fef3c7;border-radius:8px;border-left:4px solid #d97706;margin-bottom:24px;">
      <p style="margin:0;color:#111827;font-size:14px;line-height:1.6;">
        Dacă <strong>nu tu</strong> ai făcut această modificare, contactează-ne imediat la <a href="mailto:contact@immalert.ro" style="color:#16a34a;">contact@immalert.ro</a>.
      </p>
    </div>
    <a href="${APP_URL}/dashboard" style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Accesează contul →
    </a>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Parola ta ImmAlert a fost schimbată",
    html: emailShell("Securitate cont", body),
  });
}

export async function sendAlertEmail(
  email: string,
  companyName: string,
  changes: { field: string; oldValue: string; newValue: string }[],
  companyId: string,
  tipAlerta: "IMPORTANT" | "INFO" = "INFO"
) {
  const resend = getResend();
  const emoji = tipAlerta === "IMPORTANT" ? "⚠️" : "ℹ️";
  const label = tipAlerta === "IMPORTANT" ? "Alertă Importantă" : "Informație";

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

  const changesHtml = changes
    .map(
      (c) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">${FIELD_LABELS[c.field] || c.field}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#dc2626;font-size:14px;">${c.oldValue || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#16a34a;font-size:14px;font-weight:500;">${c.newValue || "—"}</td>
      </tr>`
    )
    .join("");

  const body = `
    <h2 style="color:#111827;margin:0 0 4px;font-size:18px;">${emoji} Modificări detectate</h2>
    <p style="color:#374151;margin:0 0 2px;font-size:15px;font-weight:600;">${companyName}</p>
    <p style="color:#6b7280;margin:0 0 20px;font-size:13px;">Data: ${new Date().toLocaleDateString("ro-RO")}</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Câmp</th>
          <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Valoare veche</th>
          <th style="padding:10px 12px;text-align:left;color:#6b7280;font-size:13px;font-weight:600;border-bottom:1px solid #e5e7eb;">Valoare nouă</th>
        </tr>
      </thead>
      <tbody>${changesHtml}</tbody>
    </table>
    <div style="margin-top:24px;padding:16px 20px;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a;margin-bottom:24px;">
      <p style="margin:0;color:#111827;font-size:14px;line-height:1.6;">
        Monitorizarea acestei firme este activă în contul tău ImmAlert. Vei primi o alertă pe email de fiecare dată când se schimbă ceva.
      </p>
    </div>
    <a href="${APP_URL}/dashboard/companies/${companyId}" style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Vezi detalii în dashboard →
    </a>
  `;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${emoji} ${label} ImmAlert — ${companyName} a suferit modificări`,
    html: emailShell(`${label} — ${new Date().toLocaleDateString("ro-RO")}`, body),
  });
}

export async function sendUrgentAlertEmail(
  email: string,
  companyName: string,
  alertType: string,
  details: string
) {
  const resend = getResend();
  const body = `
    <div style="padding:14px 18px;background:#fee2e2;border-radius:8px;border-left:4px solid #dc2626;margin-bottom:20px;">
      <p style="margin:0;color:#dc2626;font-size:16px;font-weight:700;">🚨 ${alertType}</p>
    </div>
    <p style="color:#111827;font-size:15px;font-weight:600;margin:0 0 6px;">${companyName}</p>
    <p style="color:#374151;font-size:14px;margin:0 0 12px;line-height:1.6;">${details}</p>
    <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">Data detectării: <strong style="color:#111827;">${new Date().toLocaleDateString("ro-RO")}</strong></p>
    <a href="${APP_URL}/dashboard/alerts" style="display:inline-block;background:#dc2626;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Vezi alertele →
    </a>
  `;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `🚨 URGENT ImmAlert — ${companyName}: ${alertType}`,
    html: emailShell("Alertă urgentă", body),
  });
}

export async function sendQuickReportEmail(email: string, company: FirmaData) {
  const resend = getResend();

  const rows: { label: string; value: string }[] = [
    { label: "Denumire", value: company.denumire },
    { label: "CUI", value: company.cui },
    { label: "Nr. Reg. Com.", value: company.nr_reg_com || "—" },
    { label: "Adresă", value: company.adresa || "—" },
    { label: "Stare firmă", value: company.stare ? badge(company.stare, "#dcfce7", "#16a34a") : "—" },
    { label: "Data înregistrare", value: company.data_inregistrare || "—" },
    { label: "TVA", value: tvaBadge(company.tva) },
    { label: "Status", value: statusBadge(!company.inactiv) },
    { label: "e-Factura", value: efactBadge(company.e_factura) },
    { label: "Cod CAEN", value: company.cod_caen || "—" },
  ];

  const rowsHtml = rows
    .map(
      (r, i) => `
      <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"};">
        <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%;">${r.label}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:500;">${r.value}</td>
      </tr>`
    )
    .join("");

  const body = `
    <h2 style="color:#111827;margin:0 0 4px;font-size:20px;">${company.denumire}</h2>
    <p style="color:#6b7280;margin:0 0 24px;font-size:13px;">CUI: ${company.cui} &nbsp;·&nbsp; Generat pe ${new Date().toLocaleDateString("ro-RO")}</p>

    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <tbody>${rowsHtml}</tbody>
    </table>

    <div style="margin-top:24px;padding:16px 20px;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a;">
      <p style="margin:0;color:#111827;font-size:14px;line-height:1.6;">
        Monitorizarea acestei firme este activă în contul tău ImmAlert. Vei primi o alertă pe email de fiecare dată când se schimbă ceva.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Raport ImmAlert — ${company.denumire} (CUI ${company.cui})`,
    html: emailShell("Raport rapid firmă", body),
  });
}
