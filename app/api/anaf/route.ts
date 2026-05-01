import { NextRequest, NextResponse } from "next/server";
import { fetchSingleCompany } from "@/lib/anaf";

export async function GET(req: NextRequest) {
  const cui = req.nextUrl.searchParams.get("cui");
  if (!cui || !/^\d{2,10}$/.test(cui)) {
    return NextResponse.json({ error: "CUI invalid" }, { status: 400 });
  }

  const data = await fetchSingleCompany(cui);
  if (!data) return NextResponse.json({ error: "CUI-ul nu a fost găsit" }, { status: 404 });

  return NextResponse.json(data);
}
