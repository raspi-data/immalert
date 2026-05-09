import { NextRequest, NextResponse } from "next/server";
import { fetchFirmaByCode, getBilanturiIstorice, type BilantAnual } from "@/lib/anaf";
import { sendQuickReportEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cui, email } = body as { cui?: string; email?: string };

    // Validate CUI
    const cuiRaw = String(cui ?? "").trim().toUpperCase().replace(/^RO/, "");
    if (!cuiRaw || !/^\d{2,12}$/.test(cuiRaw)) {
      return NextResponse.json(
        { error: "CUI invalid. Introdu un CUI format din cifre (ex: 14388698 sau RO14388698)." },
        { status: 400 }
      );
    }

    // Validate email
    const emailTrimmed = String(email ?? "").trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      return NextResponse.json({ error: "Adresa de email este invalida." }, { status: 400 });
    }

    const cuiNorm = String(parseInt(cuiRaw, 10));

    // Fetch company data
    let company;
    try {
      company = await fetchFirmaByCode(cuiNorm);
    } catch (err) {
      console.error("[quick-check] FirmeAPI error:", err);
      return NextResponse.json(
        { error: "Serviciul de date este temporar indisponibil. Incearca din nou in cateva minute." },
        { status: 503 }
      );
    }

    if (!company) {
      return NextResponse.json({ error: "Firma cu acest CUI nu a fost gasita in baza de date." }, { status: 404 });
    }

    // Fetch bilanturi best-effort (nu blocam raspunsul daca esueaza)
    let bilanturi: BilantAnual[] = [];
    try {
      bilanturi = await getBilanturiIstorice(parseInt(company.cui, 10), 3);
    } catch (err) {
      console.error("[quick-check] Bilant fetch failed:", err);
    }

    // Send email best-effort
    try {
      await sendQuickReportEmail(emailTrimmed, company);
    } catch (err) {
      console.error("[quick-check] Email send failed:", err);
    }

    return NextResponse.json({ success: true, company, bilanturi });
  } catch (err) {
    console.error("[quick-check] Unexpected error:", err);
    return NextResponse.json({ error: "Eroare interna. Incearca din nou." }, { status: 500 });
  }
}
