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
}

const BASE_URL = "https://www.firmeapi.ro/api/v1";

export async function fetchFirmaByCode(cui: string): Promise<FirmaData | null> {
  const apiKey = process.env.FIRMEAPI_KEY;
  if (!apiKey) throw new Error("FIRMEAPI_KEY not set");

  const url = `${BASE_URL}/firma/${cui}?api_key=${apiKey}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
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
    console.error(`[firmeapi] HTTP ${res.status} for CUI ${cui}: ${body}`);
    throw new Error(`FirmeAPI error: ${res.status} — ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  // API may wrap data in { data: {...} } or return directly
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
  };
}
