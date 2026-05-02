import { NextRequest, NextResponse } from "next/server";
import { fetchSingleCompany } from "@/lib/anaf";
import { sendQuickReportEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cui, email } = body;

    // Strip RO prefix if present (e.g. "RO14388698" -> "14388698")
    const cuiRaw = String(cui).trim().toUpperCase().replace(/^RO/, "");
    if (!cuiRaw || !/^\d{2,12}$/.test(cuiRaw)) {
      return NextResponse.json({ error: "CUI invalid. Introdu un CUI valid format din cifre (ex: 14388698 sau RO14388698)." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return NextResponse.json({ error: "Adresa de email este invalida." }, { status: 400 });
    }

    const cuiNormalized = String(parseInt(cuiRaw, 10));
    console.log("[v0] quick-check CUI normalized:", cuiNormalized);
    const company = await fetchSingleCompany(cuiNormalized);
    console.log("[v0] quick-check company result:", company);
    if (!company) {
      return NextResponse.json({ error: "Firma cu acest CUI nu a fost gasita in baza ANAF." }, { status: 404 });
    }

    await sendQuickReportEmail(String(email).trim(), company);

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (err) {
    console.error("[quick-check] error:", err);
    return NextResponse.json({ error: "Eroare interna. Incearca din nou." }, { status: 500 });
  }
}
