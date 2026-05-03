// Official ANAF APIs — no auth required, free, server-side only
// v9/tva: batch up to 100 CUIs · bilant: 1 CUI per request

// ─── Raw ANAF v9 types ─────────────────────────────────────────────────────────

interface AnafDateGenerale {
  cui: number;
  denumire: string;
  adresa: string;
  telefon: string;
  codPostal: string;
  act: string;
  stare_inregistrare: string;
  data_inreg_Reg_RO_e_Factura: string;
  organFiscalCompetent: string;
  forma_juridica: string;
  forma_de_proprietate: string;
  forma_organizare: string;
  nrRegCom: string;
  cod_CAEN: string;
  iban: string;
  statusRO_e_Factura: boolean;
  data_inregistrare: string;
}
interface AnafTvaInfo {
  scpTVA: boolean;
  perioade_TVA: { data_inceput_ScpTVA: string; data_sfarsit_ScpTVA: string }[];
}
interface AnafRtvai {
  statusTvaIncasare: boolean;
  dataInceputTvaInc: string;
  dataSfarsitTvaInc: string;
}
interface AnafStareInactiv {
  statusInactivi: boolean;
  dataInactivare: string;
  dataReactivare: string;
  dataPublicare: string;
  dataRadiere: string;
}
interface AnafSplitTVA { statusSplitTVA: boolean; dataInceputSplitTVA: string; dataAnulareSplitTVA: string }
interface AnafSediu {
  sdenumire_Localitate: string; sdenumire_Strada: string; snumar_Strada: string;
  sdenumire_Judet: string; scod_JudetAuto: string; scod_Postal: string; sdetalii_Adresa: string;
}
interface AnafRawCompany {
  date_generale: AnafDateGenerale;
  inregistrare_scop_Tva: AnafTvaInfo;
  inregistrare_RTVAI: AnafRtvai;
  stare_inactiv: AnafStareInactiv;
  inregistrare_SplitTVA: AnafSplitTVA;
  adresa_sediu_social: AnafSediu;
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface FirmaData {
  // Identifiers
  cui: string;
  denumire: string;
  nr_reg_com: string;
  cod_caen: string;
  // Address
  adresa: string;
  judet: string;
  // Status
  stare: string;
  data_inregistrare: string;
  data_radiere: string;
  inactiv: boolean;
  data_inactivare: string;
  // Tax
  tva: boolean;
  tva_data_inceput: string;
  tva_incasare: boolean;
  split_tva: boolean;
  e_factura: boolean;
  e_factura_data_inregistrare: string;
  // Info
  telefon: string;
  forma_juridica: string;
  organ_fiscal: string;
}

export interface BilantAnual {
  an: number;
  cui: number;
  denumire: string;
  cod_caen: number;
  den_caen: string;
  active_imobilizate: number;
  active_circulante: number;
  stocuri: number;
  creante: number;
  casa_si_conturi_banci: number;
  datorii: number;
  capitaluri_total: number;
  capital_subscris_varsat: number;
  cifra_afaceri_neta: number;
  venituri_totale: number;
  cheltuieli_totale: number;
  profit_brut: number;
  profit_net: number;
  pierdere_neta: number;
  numar_salariati: number;
}

// ─── ANAF raw fetch ───────────────────────────────────────────────────────────

const TVA_URL = "https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva";
const BILANT_URL = "https://webservicesp.anaf.ro/bilant";

async function anafTvaPost(cuis: number[]): Promise<{ found: AnafRawCompany[]; notFound: number[] }> {
  const today = new Date().toISOString().split("T")[0];
  const res = await fetch(TVA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuis.map((c) => ({ cui: c, data: today }))),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`ANAF TVA ${res.status}`);
  const json = await res.json();
  return { found: json.found ?? [], notFound: json.notFound ?? [] };
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

function mapRaw(raw: AnafRawCompany): FirmaData {
  const dg = raw.date_generale;
  const tva = raw.inregistrare_scop_Tva;
  const rtvai = raw.inregistrare_RTVAI;
  const split = raw.inregistrare_SplitTVA;
  const inact = raw.stare_inactiv;
  const sediu = raw.adresa_sediu_social;
  const tvaPerioade = tva.perioade_TVA ?? [];
  const lastPeriod = tvaPerioade[tvaPerioade.length - 1];

  return {
    cui: String(dg.cui),
    denumire: dg.denumire ?? "",
    nr_reg_com: dg.nrRegCom ?? "",
    cod_caen: String(dg.cod_CAEN ?? ""),
    adresa: dg.adresa ?? "",
    judet: sediu?.sdenumire_Judet ?? "",
    stare: dg.stare_inregistrare ?? "",
    data_inregistrare: dg.data_inregistrare ?? "",
    data_radiere: inact.dataRadiere ?? "",
    inactiv: inact.statusInactivi ?? false,
    data_inactivare: inact.dataInactivare ?? "",
    tva: tva.scpTVA ?? false,
    tva_data_inceput: lastPeriod?.data_inceput_ScpTVA ?? "",
    tva_incasare: rtvai.statusTvaIncasare ?? false,
    split_tva: split.statusSplitTVA ?? false,
    e_factura: dg.statusRO_e_Factura ?? false,
    e_factura_data_inregistrare: dg.data_inreg_Reg_RO_e_Factura ?? "",
    telefon: dg.telefon ?? "",
    forma_juridica: dg.forma_juridica ?? "",
    organ_fiscal: dg.organFiscalCompetent ?? "",
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchFirmaByCode(cui: string): Promise<FirmaData | null> {
  const cuiNum = parseInt(cui, 10);
  if (isNaN(cuiNum)) return null;

  let found: AnafRawCompany[], notFound: number[];
  try {
    ({ found, notFound } = await anafTvaPost([cuiNum]));
  } catch (err) {
    console.error(`[anaf] Network error CUI ${cui}:`, err);
    throw err;
  }

  if (notFound.includes(cuiNum) || found.length === 0) {
    console.log(`[anaf] CUI ${cui} not found in ANAF`);
    return null;
  }

  const firma = mapRaw(found[0]);
  console.log(`[anaf] CUI ${cui} → ${firma.denumire}`);
  return firma;
}

export async function fetchFirmeByCodes(cuis: string[]): Promise<Map<string, FirmaData>> {
  const results = new Map<string, FirmaData>();

  // Build num→str mapping
  const numToStr = new Map<number, string>();
  const validNums: number[] = [];
  for (const c of cuis) {
    const n = parseInt(c, 10);
    if (!isNaN(n)) { validNums.push(n); numToStr.set(n, c); }
  }

  for (let i = 0; i < validNums.length; i += 100) {
    const chunk = validNums.slice(i, i + 100);
    try {
      const { found } = await anafTvaPost(chunk);
      for (const raw of found) {
        const firma = mapRaw(raw);
        const key = numToStr.get(raw.date_generale.cui) ?? String(raw.date_generale.cui);
        results.set(key, firma);
      }
      if (i + 100 < validNums.length) await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`[anaf] Batch chunk ${i} error:`, err);
    }
  }

  return results;
}

// ─── Bilanț ───────────────────────────────────────────────────────────────────

export async function getBilant(cui: number, an: number): Promise<BilantAnual | null> {
  try {
    const res = await fetch(`${BILANT_URL}?an=${an}&cui=${cui}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.i || data.i.length === 0) return null;

    const ind: Record<string, number> = {};
    for (const item of data.i as { indicator: string; val_indicator: number }[]) {
      ind[item.indicator] = item.val_indicator;
    }

    return {
      an: data.an,
      cui: data.cui,
      denumire: data.deni ?? "",
      cod_caen: data.caen ?? 0,
      den_caen: data.den_caen ?? "",
      active_imobilizate: ind.I1 ?? 0,
      active_circulante: ind.I2 ?? 0,
      stocuri: ind.I3 ?? 0,
      creante: ind.I4 ?? 0,
      casa_si_conturi_banci: ind.I5 ?? 0,
      datorii: ind.I7 ?? 0,
      capitaluri_total: ind.I10 ?? 0,
      capital_subscris_varsat: ind.I11 ?? 0,
      cifra_afaceri_neta: ind.I13 ?? 0,
      venituri_totale: ind.I14 ?? 0,
      cheltuieli_totale: ind.I15 ?? 0,
      profit_brut: ind.I16 ?? 0,
      profit_net: ind.I18 ?? 0,
      pierdere_neta: ind.I19 ?? 0,
      numar_salariati: ind.I20 ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getBilanturiIstorice(cui: number, ani = 5): Promise<BilantAnual[]> {
  const currentYear = new Date().getFullYear();
  const results: BilantAnual[] = [];
  for (let an = currentYear - 1; an >= currentYear - ani; an--) {
    const b = await getBilant(cui, an);
    if (b) results.push(b);
  }
  return results;
}

// ─── Change detection (used by monitoring) ────────────────────────────────────

export type ChangePriority = "CRITIC" | "IMPORTANT" | "INFO";

export interface DetectedChange {
  field: string;
  oldValue: string;
  newValue: string;
  priority: ChangePriority;
}

const FIELD_PRIORITIES: Record<string, ChangePriority> = {
  inactiv: "CRITIC",
  data_radiere: "CRITIC",
  tva: "IMPORTANT",
  e_factura: "IMPORTANT",
  tva_incasare: "IMPORTANT",
  adresa: "INFO",
  cod_caen: "INFO",
  stare: "INFO",
  split_tva: "INFO",
};

const WATCHED = Object.keys(FIELD_PRIORITIES);

export function detectChanges(
  saved: Record<string, unknown>,
  current: FirmaData
): DetectedChange[] {
  const changes: DetectedChange[] = [];
  const curr = current as unknown as Record<string, unknown>;

  for (const field of WATCHED) {
    const oldVal = String(saved[field] ?? "");
    const newVal = String(curr[field] ?? "");
    if (oldVal !== newVal) {
      changes.push({ field, oldValue: oldVal, newValue: newVal, priority: FIELD_PRIORITIES[field] });
    }
  }
  return changes;
}

// Maps old openapi.ro / FirmeAPI field names so first run after migration
// doesn't generate false-positive alerts.
export function normalizeLegacyStoredState(raw: Record<string, unknown>): Record<string, unknown> {
  // Already in new format
  if ("tva" in raw && !("scpTVA" in raw)) return raw;

  const tvaObj = raw.tva as Record<string, unknown> | undefined;
  const inactivObj = raw.status_inactiv as Record<string, unknown> | undefined;
  const tvaIncasareObj = raw.tva_incasare as Record<string, unknown> | undefined;
  const splitTvaObj = raw.split_tva as Record<string, unknown> | undefined;

  return {
    ...raw,
    tva: raw.scpTVA ?? tvaObj?.platitor ?? false,
    inactiv: raw.statusInactivi ?? inactivObj?.inactiv ?? false,
    e_factura: raw.statusRO_e_Factura ?? raw.e_factura ?? false,
    tva_incasare: raw.statusTvaIncasare ?? tvaIncasareObj?.activ ?? false,
    split_tva: raw.statusSplitTVA ?? splitTvaObj?.activ ?? false,
    adresa: raw.adresa ?? "",
    cod_caen: raw.cod_caen ?? raw.cod_CAEN ?? "",
    stare: raw.stare ?? raw.stare_inregistrare ?? "",
    data_radiere: raw.data_radiere ?? raw.dataRadiere ?? "",
  };
}
