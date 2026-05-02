import { NextRequest, NextResponse } from "next/server";
import { fetchFirmaByCode } from "@/lib/firmeapi";
import { sendQuickReportEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cui, email } = body;

    const cuiRaw = String(cui).trim().toUpperCase().replace(/^RO/, "");
    if (!cuiRaw || !/^\d{2,12}$/.test(cuiRaw)) {
      return NextResponse.json({ error: "CUI invalid. Introdu un CUI valid format din cifre (ex: 14388698 sau RO14388698)." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return NextResponse.json({ error: "Adresa de email este invalida." }, { status: 400 });
    }

    const cuiNormalized = String(parseInt(cuiRaw, 10));

    let company;
    try {
      company = await fetchFirmaByCode(cuiNormalized);
    } catch (fetchErr) {
      console.error("[quick-check] FirmeAPI error:", fetchErr);
      return NextResponse.json({ error: "Serviciul de date este temporar indisponibil. Incearca din nou." }, { status: 503 });
    }

    if (!company) {
      return NextResponse.json({ error: "Firma cu acest CUI nu a fost gasita." }, { status: 404 });
    }

    // Email send is best-effort — don't fail the request if it throws
    try {
      await sendQuickReportEmail(String(email).trim(), company);
    } catch (emailErr) {
      console.error("[quick-check] Email send failed:", emailErr);
    }

    return NextResponse.json({ success: true, company });
  } catch (err) {
    console.error("[quick-check] error:", err);
    return NextResponse.json({ error: "Eroare interna. Incearca din nou." }, { status: 500 });
  }
}
