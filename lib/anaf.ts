export interface AnafCompanyData {
  cui: string;
  denumire: string;
  adresa: string;
  stare_inregistrare: string;
  scpTVA: boolean;
  dataInactivitate?: string;
  dataReactivare?: string;
  dataPublicare?: string;
  dataAnulare?: string;
  mesaj?: string;
  statusInactivi: boolean;
  dataInceputInactivitate?: string;
  dataAnulareInactivitate?: string;
  dataPublicareInactivitate?: string;
  statusEFactura: boolean;
  dataStartEFactura?: string;
  dataAnulareEFactura?: string;
  // Extra fields from openapi.ro
  nrRegCom?: string;
  telefon?: string;
  fax?: string;
  codPostal?: string;
  act?: string;
  stare?: string;
  dataInregistrare?: string;
  capitalSocial?: number;
  nrAngajati?: number;
}

// openapi.ro response shape (partial)
interface OpenApiCompany {
  cui?: number;
  cif?: number;
  denumire?: string;
  adresa?: string;
  nrRegCom?: string;
  telefon?: string;
  fax?: string;
  codPostal?: string;
  act?: string;
  stare?: string;
  dataInregistrare?: string;
  capitalSocial?: number;
  nrAngajati?: number;
  statusInactivi?: boolean;
  dataInceputInactivitate?: string;
  dataAnulareInactivitate?: string;
  inregistratTVA?: boolean;
  dataInregistrareTVA?: string;
  dataAnulareTVA?: string;
  eFactura?: boolean;
  dataInregistrareEFactura?: string;
  dataAnulareEFactura?: string;
  stareInregistrare?: string;
}

async function fetchFromOpenApiRo(cui: string): Promise<AnafCompanyData | null> {
  const apiKey = process.env.OPENAPI_RO_KEY;
  if (!apiKey) {
    throw new Error("OPENAPI_RO_KEY environment variable is not set");
  }

  const response = await fetch(`https://api.openapi.ro/api/companies/${cui}`, {
    headers: {
      "x-api-key": apiKey,
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[anaf] openapi.ro error for CUI ${cui}:`, response.status, errText);
    return null;
  }

  const raw: OpenApiCompany = await response.json();

  const cuiStr = String(raw.cui ?? raw.cif ?? cui);

  return {
    cui: cuiStr,
    denumire: raw.denumire ?? "",
    adresa: raw.adresa ?? "",
    stare_inregistrare: raw.stareInregistrare ?? raw.stare ?? "",
    scpTVA: raw.inregistratTVA ?? false,
    dataInactivitate: raw.dataAnulareTVA,
    dataReactivare: undefined,
    dataPublicare: raw.dataInregistrareTVA,
    dataAnulare: raw.dataAnulareTVA,
    mesaj: undefined,
    statusInactivi: raw.statusInactivi ?? false,
    dataInceputInactivitate: raw.dataInceputInactivitate,
    dataAnulareInactivitate: raw.dataAnulareInactivitate,
    dataPublicareInactivitate: undefined,
    statusEFactura: raw.eFactura ?? false,
    dataStartEFactura: raw.dataInregistrareEFactura,
    dataAnulareEFactura: raw.dataAnulareEFactura,
    nrRegCom: raw.nrRegCom,
    telefon: raw.telefon,
    fax: raw.fax,
    codPostal: raw.codPostal,
    act: raw.act,
    stare: raw.stare,
    dataInregistrare: raw.dataInregistrare,
    capitalSocial: raw.capitalSocial,
    nrAngajati: raw.nrAngajati,
  };
}

export async function fetchAnafData(cuis: string[]): Promise<AnafCompanyData[]> {
  const results: AnafCompanyData[] = [];

  await Promise.all(
    cuis.map(async (cui) => {
      try {
        const company = await fetchFromOpenApiRo(cui);
        if (company) results.push(company);
      } catch (err) {
        console.error(`[anaf] fetchAnafData error for CUI ${cui}:`, err);
      }
    })
  );

  return results;
}

export async function fetchSingleCompany(cui: string): Promise<AnafCompanyData | null> {
  const normalizedCui = String(parseInt(cui, 10));
  try {
    return await fetchFromOpenApiRo(normalizedCui);
  } catch (err) {
    console.error("[anaf] fetchSingleCompany error:", err);
    return null;
  }
}
