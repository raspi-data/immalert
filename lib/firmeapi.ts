export interface BilanţAnual {
  an: number;
  cifra_afaceri: number;
  profit: number;
  angajati: number;
}

export interface FirmaData {
  cui: string;
  denumire: string;
  adresa: string;
  stare: string;
  tva: boolean;
  cod_caen: string;
  denumire_caen: string;
  administrator: string;
  inactiv: boolean;
  insolventa: boolean;
  nr_reg_com?: string;
  capital_social?: number;
  bilant?: BilanţAnual[];
}

const BASE_URL = "https://www.firmeapi.ro/api/v1";

function headers(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "X-API-Key": apiKey,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export async function fetchFirmaByCode(cui: string): Promise<FirmaData | null> {
  const apiKey = process.env.FIRMEAPI_KEY;
  if (!apiKey) throw new Error("FIRMEAPI_KEY not set");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/firma/${cui}`, {
      headers: headers(apiKey),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    console.error(`[firmeapi] Network error CUI ${cui}:`, err);
    throw err;
  }

  if (res.status === 404) return null;

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch { /* ignore */ }
    console.error(`[firmeapi] HTTP ${res.status} CUI ${cui}: ${body}`);
    throw new Error(`FirmeAPI error: ${res.status} — ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  // API returns { data: {...} } wrapper or bare object
  const raw = (json?.data ?? json) as Record<string, unknown>;
  return normalize(raw);
}

export async function fetchFirmeByCodes(cuis: string[]): Promise<Map<string, FirmaData>> {
  const results = new Map<string, FirmaData>();
  const CONCURRENCY = 5;

  for (let i = 0; i < cuis.length; i += CONCURRENCY) {
    const batch = cuis.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(batch.map((c) => fetchFirmaByCode(c)));
    for (let j = 0; j < batch.length; j++) {
      const r = settled[j];
      if (r.status === "fulfilled" && r.value) {
        results.set(batch[j], r.value);
      }
    }
  }

  return results;
}

function num(v: unknown): number | undefined {
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function normalizeBilant(raw: unknown): BilanţAnual[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((b: Record<string, unknown>) => ({
      an: Number(b.an ?? b.year ?? 0),
      cifra_afaceri: Number(b.cifra_afaceri ?? b.turnover ?? 0),
      profit: Number(b.profit ?? b.net_profit ?? 0),
      angajati: Number(b.angajati ?? b.employees ?? 0),
    }))
    .filter((b) => b.an > 0);
}

function normalize(raw: Record<string, unknown>): FirmaData {
  return {
    cui: String(raw.cui ?? raw.cod_unic_inregistrare ?? ""),
    denumire: String(raw.denumire ?? raw.name ?? raw.denumire_firma ?? ""),
    adresa: String(raw.adresa ?? raw.adresa_completa ?? raw.address ?? ""),
    stare: String(raw.stare ?? raw.stare_inregistrare ?? raw.status ?? ""),
    tva: Boolean(raw.tva ?? raw.platitor_tva ?? raw.scpTVA ?? raw.tva_activ ?? false),
    cod_caen: String(raw.cod_caen ?? raw.caen ?? raw.cod_caen_principal ?? ""),
    denumire_caen: String(raw.denumire_caen ?? raw.denumire_activitate ?? ""),
    administrator: String(raw.administrator ?? raw.reprezentant_legal ?? raw.admin ?? ""),
    inactiv: Boolean(raw.inactiv ?? raw.statusInactivi ?? raw.firma_inactiva ?? false),
    insolventa: Boolean(raw.insolventa ?? raw.inInsolventa ?? raw.in_insolventa ?? false),
    nr_reg_com: raw.nr_reg_com ? String(raw.nr_reg_com) : undefined,
    capital_social: num(raw.capital_social),
    bilant: normalizeBilant(raw.bilant ?? raw.financiar ?? raw.financial),
  };
}
