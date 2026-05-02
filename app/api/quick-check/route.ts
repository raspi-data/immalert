import { NextRequest, NextResponse } from "next/server";
import { fetchSingleCompany } from "@/lib/anaf";
import { sendQuickReportEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cui, email } = body;

    if (!cui || !/^\d{2,10}$/.test(String(cui).trim())) {
      return NextResponse.json({ error: "CUI invalid. Introdu un CUI valid format din cifre." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return NextResponse.json({ error: "Adresa de email este invalida." }, { status: 400 });
    }

    const cuiNormalized = String(parseInt(String(cui).trim(), 10));
    console.log("[v0] quick-check CUI normalized:", cuiNormalized);
    const company = await fetchSingleCompany(cuiNormalized);
    console.log("[v0] quick-check company result:", company);
    if (!company) {
      return NextResponse.json({ error: "Firma cu acest CUI nu a fost gasita in baza ANAF." }, { status: 404 });
    }

    await sendQuickReportEmail(String(email).trim(), company);

    return NextResponse.json({
      success: true,
      company: {
        denumire: company.denumire,
        cui: company.cui,
      },
    });
  } catch (err) {
    console.error("[quick-check] error:", err);
    return NextResponse.json({ error: "Eroare interna. Incearca din nou." }, { status: 500 });
  }
}
