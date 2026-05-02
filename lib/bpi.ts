/**
 * BPI (Buletinul Procedurilor de Insolventa) XML Checker
 * Source: https://www.bpi.ro/
 * Frequency: daily
 *
 * Downloads the daily insolvency bulletin XML, searches for monitored CUIs,
 * and triggers urgent alerts when a company is found in the insolvency list.
 *
 * BPI publishes a daily XML file with all insolvency procedures opened that day.
 * Set BPI_XML_URL in env vars or we build the URL from today's date.
 */

export interface BpiInsolvencyRecord {
  cui: string;
  denumire: string;
  tipProcedura: string; // e.g. "Faliment", "Reorganizare judiciara", "Insolventa"
  numarDosar: string;
  tribunal: string;
  dataPublicare: string;
}

/**
 * Builds the BPI daily XML URL for a given date.
 * BPI uses the pattern: https://www.bpi.ro/wp-content/uploads/buletin/YYYY/MM/DD/bpi_YYYYMMDD.xml
 */
function buildBpiUrl(date: Date = new Date()): string {
  if (process.env.BPI_XML_URL) return process.env.BPI_XML_URL;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `https://www.bpi.ro/wp-content/uploads/buletin/${yyyy}/${mm}/${dd}/bpi_${yyyy}${mm}${dd}.xml`;
}

/**
 * Downloads the BPI XML for today (or the provided date).
 */
async function downloadBpiXml(date?: Date): Promise<string | null> {
  const url = buildBpiUrl(date);
  console.log(`[bpi] Downloading BPI XML from: ${url}`);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(60_000),
      headers: { "User-Agent": "ImmAlert/1.0 (+https://immalert.ro)" },
    });

    if (response.status === 404) {
      // BPI doesn't publish on weekends / holidays
      console.log("[bpi] No bulletin for today (404 — weekend or holiday)");
      return null;
    }

    if (!response.ok) {
      throw new Error(`BPI download failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  } catch (err) {
    console.error("[bpi] Failed to download XML:", err);
    return null;
  }
}

/**
 * Parses the BPI XML and extracts insolvency records.
 *
 * BPI XML structure (simplified):
 * <buletin>
 *   <procedura>
 *     <cui>12345678</cui>
 *     <denumire>SC EXEMPLU SRL</denumire>
 *     <tip_procedura>Faliment</tip_procedura>
 *     <numar_dosar>1234/1/2024</numar_dosar>
 *     <tribunal>Tribunalul Bucuresti</tribunal>
 *     <data_publicare>2024-01-15</data_publicare>
 *   </procedura>
 * </buletin>
 *
 * NOTE: The exact tag names may vary. We use regex-based parsing to avoid
 * needing an external XML dependency.
 */
export function parseBpiXml(xmlContent: string): BpiInsolvencyRecord[] {
  const records: BpiInsolvencyRecord[] = [];

  // Extract all <procedura>...</procedura> blocks
  const proceduraRegex = /<procedura[^>]*>([\s\S]*?)<\/procedura>/gi;
  let match: RegExpExecArray | null;

  while ((match = proceduraRegex.exec(xmlContent)) !== null) {
    const block = match[1];

    const get = (tag: string): string => {
      const m = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(block);
      return m ? m[1].trim().replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") : "";
    };

    // Try multiple tag name variants used across BPI versions
    const cui = (get("cui") || get("cod_unic") || get("cif") || "").replace(/\D/g, "");
    if (!cui) continue;

    records.push({
      cui,
      denumire: get("denumire") || get("nume") || get("debitor") || "",
      tipProcedura: get("tip_procedura") || get("tip") || get("procedura_tip") || "Insolventa",
      numarDosar: get("numar_dosar") || get("dosar") || get("nr_dosar") || "",
      tribunal: get("tribunal") || get("instanta") || "",
      dataPublicare: get("data_publicare") || get("data") || new Date().toISOString().split("T")[0],
    });
  }

  return records;
}

/**
 * Checks if any of the monitored CUIs appear in today's BPI bulletin.
 * Returns only the records that match monitored CUIs.
 */
export async function checkBpiInsolvencies(
  monitoredCuis: string[]
): Promise<BpiInsolvencyRecord[]> {
  console.log(`[bpi] Checking BPI for ${monitoredCuis.length} companies...`);

  const xmlContent = await downloadBpiXml();
  if (!xmlContent) return [];

  const allRecords = parseBpiXml(xmlContent);
  console.log(`[bpi] Total BPI records today: ${allRecords.length}`);

  const cuiSet = new Set(monitoredCuis.map((c) => c.replace(/\D/g, "")));
  const matches = allRecords.filter((r) => cuiSet.has(r.cui.replace(/\D/g, "")));

  console.log(`[bpi] Found ${matches.length} monitored companies in BPI`);
  return matches;
}
