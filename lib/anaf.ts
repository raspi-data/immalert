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
}

export async function fetchAnafData(cuis: string[]): Promise<AnafCompanyData[]> {
  const batches: string[][] = [];
  for (let i = 0; i < cuis.length; i += 500) {
    batches.push(cuis.slice(i, i + 500));
  }

  const results: AnafCompanyData[] = [];

  for (const batch of batches) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const payload = batch.map((cui) => ({ cui: parseInt(cui), data: today }));

      const response = await fetch("https://api.anaf.ro/v8/ws/tva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      console.log("[v0] ANAF response status:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error("[v0] ANAF error body:", errText);
        continue;
      }

      const data = await response.json();
      console.log("[v0] ANAF response data:", JSON.stringify(data).slice(0, 500));

      if (data.found) {
        for (const item of data.found) {
          results.push({
            cui: String(item.date_generale?.cui || ""),
            denumire: item.date_generale?.denumire || "",
            adresa: item.date_generale?.adresa || "",
            stare_inregistrare: item.date_generale?.stare_inregistrare || "",
            scpTVA: item.inregistrare_scop_Tva?.scpTVA || false,
            dataInactivitate: item.inregistrare_scop_Tva?.dataInactivitate,
            dataReactivare: item.inregistrare_scop_Tva?.dataReactivare,
            dataPublicare: item.inregistrare_scop_Tva?.dataPublicare,
            dataAnulare: item.inregistrare_scop_Tva?.dataAnulare,
            mesaj: item.inregistrare_scop_Tva?.mesaj,
            statusInactivi: item.inregistrare_RTVAI?.statusInactivi || false,
            dataInceputInactivitate: item.inregistrare_RTVAI?.dataInceputInactivitate,
            dataAnulareInactivitate: item.inregistrare_RTVAI?.dataAnulareInactivitate,
            dataPublicareInactivitate: item.inregistrare_RTVAI?.dataPublicareInactivitate,
            statusEFactura: item.stare_eFactura?.stareEfactura || false,
            dataStartEFactura: item.stare_eFactura?.dataStartEfactura,
            dataAnulareEFactura: item.stare_eFactura?.dataAnulareEfactura,
          });
        }
      }
    } catch (err) {
      console.error("ANAF API error:", err);
    }
  }

  return results;
}

export async function fetchSingleCompany(cui: string): Promise<AnafCompanyData | null> {
  const normalizedCui = String(parseInt(cui, 10));
  const results = await fetchAnafData([normalizedCui]);
  // Match by numeric value to avoid string vs number mismatch from ANAF response
  return results.find((r) => parseInt(r.cui, 10) === parseInt(cui, 10)) || null;
}
