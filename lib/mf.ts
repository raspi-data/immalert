/**
 * Ministerul Finantelor — Bilant CSV Parser
 * Source: https://data.gov.ro/dataset/bilant
 * Frequency: annual (published once per year, usually Q2 for previous year)
 *
 * Fields saved: cifra de afaceri, profit/pierdere, angajati, active totale, datorii totale
 * Compares with previous year's data stored in DB.
 *
 * Set MF_BILANT_CSV_URL in env vars to point to the latest published CSV.
 */

import { prisma } from "./prisma";

export interface MfBilantData {
  cui: string;
  an: number;
  cifraAfaceri: number;        // CA_NET
  profit: number;              // PROFIT_NET (negative = pierdere)
  angajati: number;            // NR_ANGAJATI
  activeTotale: number;        // ACTIVE_TOTALE
  datoriiTotale: number;       // DATORII_TOTALE
  capitaluriProprii: number;   // CAPITALURI_PROPRII
}

async function downloadMfCsv(): Promise<string> {
  const url = process.env.MF_BILANT_CSV_URL;
  if (!url) {
    throw new Error("MF_BILANT_CSV_URL environment variable not set");
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(180_000), // 3 min — these files can be large (100MB+)
    headers: { "User-Agent": "ImmAlert/1.0 (+https://immalert.ro)" },
  });

  if (!response.ok) {
    throw new Error(`Failed to download MF bilant CSV: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === "," || char === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function toNumber(val: string): number {
  const n = parseFloat(val.replace(/\s/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

/**
 * Parses the MF bilant CSV and returns a map of CUI -> MfBilantData.
 *
 * Typical MF CSV columns (may vary by year):
 * CUI, AN, DENUMIRE, CA_NET, PROFIT_NET, NR_ANGAJATI, ACTIVE_TOTALE,
 * DATORII_TOTALE, CAPITALURI_PROPRII, ...
 */
export function parseMfBilantCsv(csvContent: string): Map<string, MfBilantData> {
  const lines = csvContent.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return new Map();

  const headerLine = lines[0].toLowerCase().replace(/\r/g, "");
  const headers = parseCsvLine(headerLine);

  const idx = {
    cui: headers.findIndex((h) => h.includes("cui") || h.includes("cod_fiscal")),
    an: headers.findIndex((h) => h === "an" || h.includes("exercit")),
    cifraAfaceri: headers.findIndex((h) => h.includes("ca_net") || h.includes("cifra_afaceri") || h.includes("ca net")),
    profit: headers.findIndex((h) => h.includes("profit_net") || h.includes("rezultat_net") || h.includes("profit net")),
    angajati: headers.findIndex((h) => h.includes("angajat") || h.includes("salariat") || h.includes("nr_med")),
    active: headers.findIndex((h) => h.includes("active_tot") || h.includes("total_active")),
    datorii: headers.findIndex((h) => h.includes("datorii_tot") || h.includes("total_datorii")),
    capitaluri: headers.findIndex((h) => h.includes("capitaluri") || h.includes("capital_propriu")),
  };

  const map = new Map<string, MfBilantData>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i].replace(/\r/g, ""));
    const cui = idx.cui >= 0 ? cols[idx.cui]?.replace(/\D/g, "") : "";
    if (!cui) continue;

    const an = idx.an >= 0 ? parseInt(cols[idx.an]) || new Date().getFullYear() - 1 : new Date().getFullYear() - 1;

    map.set(cui, {
      cui,
      an,
      cifraAfaceri: idx.cifraAfaceri >= 0 ? toNumber(cols[idx.cifraAfaceri]) : 0,
      profit: idx.profit >= 0 ? toNumber(cols[idx.profit]) : 0,
      angajati: idx.angajati >= 0 ? toNumber(cols[idx.angajati]) : 0,
      activeTotale: idx.active >= 0 ? toNumber(cols[idx.active]) : 0,
      datoriiTotale: idx.datorii >= 0 ? toNumber(cols[idx.datorii]) : 0,
      capitaluriProprii: idx.capitaluri >= 0 ? toNumber(cols[idx.capitaluri]) : 0,
    });
  }

  return map;
}

/**
 * Runs the annual MF bilant check for all monitored companies.
 * Downloads and parses the CSV, compares with stored dateBilant in DB,
 * and updates the record. Returns companies with significant financial changes.
 */
export async function runMfBilantCheck(): Promise<
  { companyId: string; cui: string; nume: string; changes: { field: string; oldValue: string; newValue: string }[] }[]
> {
  console.log("[mf] Starting MF bilant check...");

  let csvContent: string;
  try {
    csvContent = await downloadMfCsv();
  } catch (err) {
    console.error("[mf] Failed to download bilant CSV:", err);
    return [];
  }

  const mfMap = parseMfBilantCsv(csvContent);
  console.log(`[mf] Parsed bilant data for ${mfMap.size} companies`);

  const companies = await prisma.company.findMany({
    select: { id: true, cui: true, nume: true, dateOnrc: true },
  });

  const results: { companyId: string; cui: string; nume: string; changes: { field: string; oldValue: string; newValue: string }[] }[] = [];

  const fieldLabels: Record<string, string> = {
    cifraAfaceri: "Cifra de afaceri (RON)",
    profit: "Profit / Pierdere net (RON)",
    angajati: "Nr. angajati",
    activeTotale: "Active totale (RON)",
    datoriiTotale: "Datorii totale (RON)",
    capitaluriProprii: "Capitaluri proprii (RON)",
  };

  for (const company of companies) {
    const newData = mfMap.get(company.cui);
    if (!newData) continue;

    // Store bilant data in the dateOnrc JSON blob under a "bilant" key
    // (avoids schema migration — bilant is financial context, not ONRC)
    const existing = (company.dateOnrc as Record<string, unknown>) || {};
    const prevBilant = (existing.bilant as Partial<MfBilantData>) || {};

    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    for (const field of Object.keys(fieldLabels) as (keyof MfBilantData)[]) {
      const oldVal = String(prevBilant[field] ?? "");
      const newVal = String(newData[field] ?? "");
      if (oldVal !== newVal && newVal !== "0" && newVal !== "") {
        changes.push({
          field: fieldLabels[field as string],
          oldValue: oldVal || "necunoscut",
          newValue: newVal,
        });
      }
    }

    if (changes.length > 0) {
      results.push({ companyId: company.id, cui: company.cui, nume: company.nume, changes });
    }

    // Persist updated bilant data — cast through JSON to satisfy Prisma's InputJsonValue
    const updatedDateOnrc = JSON.parse(
      JSON.stringify({ ...(existing as object), bilant: newData })
    );
    await prisma.company.update({
      where: { id: company.id },
      data: { dateOnrc: updatedDateOnrc },
    });
  }

  console.log(`[mf] Found bilant changes for ${results.length} companies`);
  return results;
}
