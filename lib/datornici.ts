/**
 * ANAF Lista Datornici (Mari Datornici)
 * Source: https://static.anaf.ro/static/10/Anaf/informatii_publice/
 * Frequency: monthly (published around the 15th of each month)
 *
 * ANAF publishes two CSV files monthly:
 * - Persoane Juridice (companies) — datornici_pj_YYYYMMDD.csv
 * - Persoane Fizice Autorizate — datornici_pfa_YYYYMMDD.csv
 *
 * We check if any monitored CUI appears in the companies list.
 * Triggers urgent alert when found.
 *
 * Set ANAF_DATORNICI_URL in env vars, or we auto-detect the latest file.
 */

import { prisma } from "./prisma";

export interface DatornicRecord {
  cui: string;
  denumire: string;
  sumaRestanta: number;   // total restante (RON)
  localitate?: string;
  judet?: string;
}

/**
 * Tries to find the current month's datornici file URL from ANAF static server.
 * ANAF uses predictable naming: datornici_pj_YYYYMMDD.csv
 * We try the 15th of current month, then fall back to previous month.
 */
async function detectDatornicUrl(): Promise<string | null> {
  if (process.env.ANAF_DATORNICI_URL) return process.env.ANAF_DATORNICI_URL;

  const base = "https://static.anaf.ro/static/10/Anaf/informatii_publice";
  const now = new Date();

  // Try current month on day 15 and day 16 (publication is around 15th)
  const candidates: Date[] = [];
  for (const day of [15, 16, 17, 14, 20]) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    candidates.push(d);
    // Also try previous month
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, day);
    candidates.push(prev);
  }

  for (const date of candidates) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const url = `${base}/datornici_pj_${yyyy}${mm}${dd}.csv`;

    try {
      const res = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) {
        console.log(`[datornici] Found file: ${url}`);
        return url;
      }
    } catch {
      // continue trying
    }
  }

  return null;
}

async function downloadDatornici(): Promise<string | null> {
  const url = await detectDatornicUrl();
  if (!url) {
    console.error("[datornici] Could not find datornici CSV file. Set ANAF_DATORNICI_URL.");
    return null;
  }

  console.log(`[datornici] Downloading datornici from: ${url}`);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(120_000),
      headers: { "User-Agent": "ImmAlert/1.0 (+https://immalert.ro)" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  } catch (err) {
    console.error("[datornici] Download failed:", err);
    return null;
  }
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

/**
 * Parses the ANAF datornici CSV.
 * Typical columns: CUI, DENUMIRE, SUMA_RESTANTA, LOCALITATE, JUDET
 */
export function parseDatornicCsv(csvContent: string): Map<string, DatornicRecord> {
  const lines = csvContent
    .split("\n")
    .map((l) => l.replace(/\r/g, ""))
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) return new Map();

  const headerLine = lines[0].toLowerCase();
  const headers = parseCsvLine(headerLine);

  const idx = {
    cui: headers.findIndex((h) => h.includes("cui") || h.includes("cod_fiscal") || h.includes("cod fiscal")),
    denumire: headers.findIndex((h) => h.includes("denumire") || h.includes("nume")),
    suma: headers.findIndex((h) => h.includes("suma") || h.includes("restanta") || h.includes("obligatii")),
    localitate: headers.findIndex((h) => h.includes("localitate") || h.includes("oras")),
    judet: headers.findIndex((h) => h.includes("judet") || h.includes("județ")),
  };

  const map = new Map<string, DatornicRecord>();

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const cui = idx.cui >= 0 ? cols[idx.cui]?.replace(/\D/g, "") : "";
    if (!cui) continue;

    const suma = idx.suma >= 0
      ? parseFloat(cols[idx.suma].replace(/\s/g, "").replace(",", ".")) || 0
      : 0;

    map.set(cui, {
      cui,
      denumire: idx.denumire >= 0 ? cols[idx.denumire] : "",
      sumaRestanta: suma,
      localitate: idx.localitate >= 0 ? cols[idx.localitate] : undefined,
      judet: idx.judet >= 0 ? cols[idx.judet] : undefined,
    });
  }

  return map;
}

/**
 * Checks if any monitored companies appear in the ANAF datornici list.
 * Returns matching records — these companies have outstanding tax debts
 * published by ANAF.
 */
export async function checkDatornici(
  monitoredCuis: string[]
): Promise<DatornicRecord[]> {
  console.log(`[datornici] Checking ${monitoredCuis.length} companies in datornici list...`);

  const csvContent = await downloadDatornici();
  if (!csvContent) return [];

  const datornicMap = parseDatornicCsv(csvContent);
  console.log(`[datornici] Total datornici in list: ${datornicMap.size}`);

  const cuiSet = new Set(monitoredCuis.map((c) => c.replace(/\D/g, "")));
  const matches: DatornicRecord[] = [];

  for (const cui of cuiSet) {
    const record = datornicMap.get(cui);
    if (record) matches.push(record);
  }

  console.log(`[datornici] Found ${matches.length} monitored companies in datornici list`);
  return matches;
}

/**
 * Runs the monthly datornici check and generates alerts for matches.
 * Compares with previously stored dateBpi (reused for debt tracking) to avoid
 * duplicate alerts for the same company in consecutive monthly runs.
 */
export async function runDatornicCheck(): Promise<
  { companyId: string; cui: string; nume: string; record: DatornicRecord }[]
> {
  const companies = await prisma.company.findMany({
    select: { id: true, cui: true, nume: true, dateBpi: true },
  });

  const monitoredCuis = companies.map((c) => c.cui);
  const matches = await checkDatornici(monitoredCuis);

  const results: { companyId: string; cui: string; nume: string; record: DatornicRecord }[] = [];

  for (const match of matches) {
    const company = companies.find((c) => c.cui.replace(/\D/g, "") === match.cui.replace(/\D/g, ""));
    if (!company) continue;

    // Check if this was already alerted in the current month
    const prevBpi = (company.dateBpi as Record<string, unknown>) || {};
    const prevDatornic = prevBpi.datornic as { lastAlerted?: string } | undefined;
    const thisMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    if (prevDatornic?.lastAlerted === thisMonth) {
      console.log(`[datornici] Already alerted ${company.cui} this month, skipping`);
      continue;
    }

    results.push({ companyId: company.id, cui: company.cui, nume: company.nume, record: match });

    // Mark as alerted this month
    await prisma.company.update({
      where: { id: company.id },
      data: {
        dateBpi: {
          ...(prevBpi as object),
          datornic: { lastAlerted: thisMonth, sumaRestanta: match.sumaRestanta },
        },
      },
    });
  }

  return results;
}
