/**
 * ONRC CSV Parser
 * Source: https://data.gov.ro/dataset/onrc
 * Frequency: weekly (runs every Monday)
 *
 * Fields saved: administrator, asociati, sediu, stare, CAEN, capital social
 * Compares with previous data and generates alerts on changes.
 */

import { prisma } from "./prisma";

export interface OnrcCompanyData {
  cui: string;
  denumire?: string;
  sediu?: string;
  stare?: string;
  caen?: string;
  capitalSocial?: string;
  administrator?: string;
  asociati?: string;
}

/**
 * Downloads and parses the ONRC CSV for a list of CUIs.
 * ONRC publishes multiple CSV files on data.gov.ro — we use the
 * "firme_active" dataset which is updated weekly.
 *
 * NOTE: The actual download URL changes periodically on data.gov.ro.
 * Set ONRC_CSV_URL in your environment variables to point to the latest file.
 * Fallback: https://static.anaf.ro/static/10/Anaf/informatii_publice/Agenti_economici_RA.zip
 */
async function downloadOnrcCsv(): Promise<string> {
  const url = process.env.ONRC_CSV_URL;
  if (!url) {
    throw new Error("ONRC_CSV_URL environment variable not set");
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(120_000), // 2 min timeout for large files
  });

  if (!response.ok) {
    throw new Error(`Failed to download ONRC CSV: ${response.status} ${response.statusText}`);
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
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses ONRC CSV content and returns a map of CUI -> OnrcCompanyData.
 * The CSV format from data.gov.ro has the following columns (0-indexed):
 * 0: CUI, 1: DENUMIRE, 2: SEDIU, 3: STARE, 4: COD_CAEN, 5: CAPITAL_SOCIAL,
 * 6: ADMINISTRATOR, 7: ASOCIATI (may vary — we detect by header)
 */
export function parseOnrcCsv(csvContent: string): Map<string, OnrcCompanyData> {
  const lines = csvContent.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) return new Map();

  const headerLine = lines[0].toLowerCase();
  const headers = parseCsvLine(headerLine);

  const idx = {
    cui: headers.findIndex((h) => h.includes("cui") || h.includes("cod_unic")),
    denumire: headers.findIndex((h) => h.includes("denumire") || h.includes("nume")),
    sediu: headers.findIndex((h) => h.includes("sediu") || h.includes("adresa")),
    stare: headers.findIndex((h) => h.includes("stare")),
    caen: headers.findIndex((h) => h.includes("caen")),
    capital: headers.findIndex((h) => h.includes("capital")),
    administrator: headers.findIndex((h) => h.includes("administrator")),
    asociati: headers.findIndex((h) => h.includes("asociat")),
  };

  const map = new Map<string, OnrcCompanyData>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const cui = idx.cui >= 0 ? cols[idx.cui]?.replace(/\D/g, "") : "";
    if (!cui) continue;

    map.set(cui, {
      cui,
      denumire: idx.denumire >= 0 ? cols[idx.denumire] : undefined,
      sediu: idx.sediu >= 0 ? cols[idx.sediu] : undefined,
      stare: idx.stare >= 0 ? cols[idx.stare] : undefined,
      caen: idx.caen >= 0 ? cols[idx.caen] : undefined,
      capitalSocial: idx.capital >= 0 ? cols[idx.capital] : undefined,
      administrator: idx.administrator >= 0 ? cols[idx.administrator] : undefined,
      asociati: idx.asociati >= 0 ? cols[idx.asociati] : undefined,
    });
  }

  return map;
}

/**
 * Runs the weekly ONRC check for all monitored companies.
 * Downloads the CSV, parses it, compares with stored dateOnrc, and
 * saves changes back to DB. Returns a list of companies with changes.
 */
export async function runOnrcCheck(): Promise<
  { companyId: string; cui: string; nume: string; changes: { field: string; oldValue: string; newValue: string }[] }[]
> {
  console.log("[onrc] Starting ONRC check...");

  let csvContent: string;
  try {
    csvContent = await downloadOnrcCsv();
  } catch (err) {
    console.error("[onrc] Failed to download CSV:", err);
    return [];
  }

  const onrcMap = parseOnrcCsv(csvContent);
  console.log(`[onrc] Parsed ${onrcMap.size} companies from CSV`);

  const companies = await prisma.company.findMany({
    select: { id: true, cui: true, nume: true, dateOnrc: true },
  });

  const results: { companyId: string; cui: string; nume: string; changes: { field: string; oldValue: string; newValue: string }[] }[] = [];

  const monitoredFields: (keyof OnrcCompanyData)[] = [
    "sediu",
    "stare",
    "caen",
    "capitalSocial",
    "administrator",
    "asociati",
  ];

  for (const company of companies) {
    const newData = onrcMap.get(company.cui);
    if (!newData) continue;

    const prev = (company.dateOnrc as Record<string, string>) || {};
    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    for (const field of monitoredFields) {
      const oldVal = String(prev[field] ?? "");
      const newVal = String(newData[field] ?? "");
      if (oldVal !== newVal && newVal !== "") {
        changes.push({ field, oldValue: oldVal, newValue: newVal });
      }
    }

    if (changes.length > 0) {
      results.push({ companyId: company.id, cui: company.cui, nume: company.nume, changes });
    }

    await prisma.company.update({
      where: { id: company.id },
      data: { dateOnrc: JSON.parse(JSON.stringify(newData)) },
    });
  }

  console.log(`[onrc] Found changes for ${results.length} companies`);
  return results;
}
