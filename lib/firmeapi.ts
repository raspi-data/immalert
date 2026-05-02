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

  try {
    const res = await fetch(`${BASE_URL}/${cui}?key=${apiKey}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`FirmeAPI error: ${res.status}`);

    const raw = await res.json();
    return normalize(raw);
  } catch (err) {
    console.error(`[firmeapi] Eroare CUI ${cui}:`, err);
    return null;
  }
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
    denumire: String(raw.denumire ?? raw.name ?? ""),
    adresa: String(raw.adresa ?? raw.address ?? ""),
    stare: String(raw.stare ?? raw.stare_inregistrare ?? ""),
    tva: Boolean(raw.tva ?? raw.platitor_tva ?? raw.scpTVA ?? false),
    cod_caen: String(raw.cod_caen ?? raw.caen ?? ""),
    denumire_caen: String(raw.denumire_caen ?? ""),
    administrator: String(raw.administrator ?? raw.reprezentant_legal ?? ""),
    inactiv: Boolean(raw.inactiv ?? raw.statusInactivi ?? false),
    insolventa: Boolean(raw.insolventa ?? raw.inInsolventa ?? false),
  };
}
