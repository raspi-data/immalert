import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "ImmAlert <noreply@immalert.ro>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendWelcomeEmail(email: string, name?: string) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bun venit la ImmAlert — Trialul tău de 14 zile a început!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1e40af;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">ImmAlert</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;">
          <h2 style="color:#111827;">Bun venit${name ? `, ${name}` : ""}!</h2>
          <p style="color:#374151;">Contul tău a fost creat cu succes. Ai <strong>14 zile gratuit</strong> să monitorizezi orice firmă din România.</p>
          <h3 style="color:#111827;">Ce poți face acum:</h3>
          <ul style="color:#374151;">
            <li>Adaugă firme după CUI</li>
            <li>Primești alerte instant când se schimbă ceva</li>
            <li>Monitorizezi TVA, insolvență, administrator, sediu și multe altele</li>
          </ul>
          <a href="${APP_URL}/dashboard" style="display:inline-block;background:#1e40af;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
            Accesează Dashboard-ul →
          </a>
          <p style="color:#6b7280;font-size:14px;margin-top:32px;">
            Dacă ai întrebări, răspunde la acest email.<br>
            Echipa ImmAlert
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendTrialExpiryReminder(email: string, name?: string) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "⏰ Trialul tău ImmAlert expiră în 2 zile",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#dc2626;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">ImmAlert</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;">
          <h2 style="color:#111827;">Trialul expiră în 2 zile${name ? `, ${name}` : ""}!</h2>
          <p style="color:#374151;">Nu vei mai primi alerte despre firmele monitorizate dacă nu activezi un abonament.</p>
          <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0;color:#111827;font-weight:bold;">Planuri disponibile:</p>
            <p style="color:#374151;">• <strong>99 RON/lună</strong> — plată lunară</p>
            <p style="color:#374151;">• <strong>79 RON/lună</strong> — plată anuală (economisești 240 RON/an)</p>
          </div>
          <a href="${APP_URL}/settings" style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:8px;">
            Activează Abonament →
          </a>
        </div>
      </div>
    `,
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
  const headerColor = tipAlerta === "IMPORTANT" ? "#f59e0b" : "#3b82f6";
  const emoji = tipAlerta === "IMPORTANT" ? "⚠️" : "ℹ️";
  const label = tipAlerta === "IMPORTANT" ? "Alertă Importantă" : "Informație";

  const FIELD_LABELS: Record<string, string> = {
    tva: "TVA",
    inactiv: "Status inactiv",
    insolventa: "Insolvență",
    adresa: "Adresă",
    stare: "Stare firmă",
    cod_caen: "Cod CAEN",
    administrator: "Administrator",
  };

  const changesHtml = changes
    .map(
      (c) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#374151;font-weight:500;">${FIELD_LABELS[c.field] || c.field}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#dc2626;">${c.oldValue || "—"}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#16a34a;">${c.newValue || "—"}</td>
      </tr>
    `
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${emoji} ${label} ImmAlert — ${companyName} a suferit modificări`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:${headerColor};padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">${emoji} ImmAlert — ${label}</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;">
          <h2 style="color:#111827;">Modificări detectate la <em>${companyName}</em></h2>
          <p style="color:#374151;">Data: <strong>${new Date().toLocaleDateString("ro-RO")}</strong></p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <thead>
              <tr style="background:#e5e7eb;">
                <th style="padding:8px;text-align:left;color:#374151;">Câmp</th>
                <th style="padding:8px;text-align:left;color:#374151;">Valoare veche</th>
                <th style="padding:8px;text-align:left;color:#374151;">Valoare nouă</th>
              </tr>
            </thead>
            <tbody>${changesHtml}</tbody>
          </table>
          <a href="${APP_URL}/dashboard/companies/${companyId}" style="display:inline-block;background:#1e40af;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:24px;">
            Vezi detalii în dashboard →
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendUrgentAlertEmail(
  email: string,
  companyName: string,
  alertType: string,
  details: string
) {
  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `🚨 URGENT ImmAlert — ${companyName}: ${alertType}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#dc2626;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">🚨 Alertă Urgentă ImmAlert</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;">
          <h2 style="color:#dc2626;">${alertType}</h2>
          <h3 style="color:#111827;">${companyName}</h3>
          <p style="color:#374151;">${details}</p>
          <p style="color:#374151;">Data detectării: <strong>${new Date().toLocaleDateString("ro-RO")}</strong></p>
          <a href="${APP_URL}/dashboard/alerts" style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px;">
            Vezi alertele →
          </a>
        </div>
      </div>
    `,
  });
}

export async function sendQuickReportEmail(
  email: string,
  company: {
    cui: string;
    denumire: string;
    adresa: string;
    tva: boolean;
    inactiv: boolean;
    insolventa: boolean;
    stare?: string;
    administrator?: string;
    cod_caen?: string;
  }
) {
  const resend = getResend();

  const statusBadge = (ok: boolean, labelOk: string, labelNot: string) =>
    ok
      ? `<span style="background:#dcfce7;color:#16a34a;padding:2px 10px;border-radius:99px;font-size:13px;font-weight:600;">${labelOk}</span>`
      : `<span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:99px;font-size:13px;font-weight:600;">${labelNot}</span>`;

  const rows = [
    { label: "Denumire", value: company.denumire },
    { label: "CUI", value: company.cui },
    { label: "Adresa", value: company.adresa || "—" },
    { label: "Stare firmă", value: company.stare || "—" },
    { label: "TVA", value: statusBadge(company.tva, "Platitor TVA", "Neplatitor TVA") },
    { label: "Status", value: statusBadge(!company.inactiv, "Activa", "Inactiva") },
    { label: "Insolvență", value: statusBadge(!company.insolventa, "Nu", "Da") },
    ...(company.administrator ? [{ label: "Administrator", value: company.administrator }] : []),
    ...(company.cod_caen ? [{ label: "Cod CAEN", value: company.cod_caen }] : []),
  ];

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:45%;">${r.label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:500;">${r.value}</td>
      </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Raport ImmAlert — ${company.denumire} (CUI ${company.cui})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:32px;">
        <div style="background:#1e3a5f;padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">ImmAlert</h1>
          <p style="color:#93c5fd;margin:6px 0 0;font-size:14px;">Raport rapid firmă</p>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="color:#111827;margin:0 0 4px;font-size:20px;">${company.denumire}</h2>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">CUI: ${company.cui} &nbsp;·&nbsp; Generat pe ${new Date().toLocaleDateString("ro-RO")}</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;">
            <tbody>${rowsHtml}</tbody>
          </table>
          <div style="margin-top:28px;padding:16px;background:#f0f9ff;border-radius:8px;border-left:4px solid #1e40af;">
            <p style="margin:0;color:#1e40af;font-size:14px;font-weight:600;">Vrei monitorizare continuă?</p>
            <p style="margin:6px 0 12px;color:#374151;font-size:13px;">Primești alerte automate pe email de fiecare dată când se schimbă ceva la această firmă.</p>
            <a href="${APP_URL}/register" style="display:inline-block;background:#1e40af;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
              Începe Trial Gratuit 14 Zile →
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Datele provin din FirmeAPI.ro — surse publice oficiale din România.</p>
        </div>
      </div>
    `,
  });
}
