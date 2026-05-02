import { prisma } from "./prisma";
import { fetchAnafData } from "./anaf";
import { runOnrcCheck } from "./onrc";
import { checkBpiInsolvencies } from "./bpi";
import { runMfBilantCheck } from "./mf";
import { runDatornicCheck } from "./datornici";
import {
  sendAlertEmail,
  sendUrgentAlertEmail,
  sendTrialExpiryReminder,
} from "./resend";

type JsonObject = Record<string, unknown>;

function diffObjects(
  prev: JsonObject,
  curr: JsonObject,
  fields: string[]
): { field: string; oldValue: string; newValue: string }[] {
  const changes: { field: string; oldValue: string; newValue: string }[] = [];
  for (const field of fields) {
    const oldVal = String(prev[field] ?? "");
    const newVal = String(curr[field] ?? "");
    if (oldVal !== newVal) {
      changes.push({ field, oldValue: oldVal, newValue: newVal });
    }
  }
  return changes;
}

// ---------------------------------------------------------------------------
// 1. ANAF — runs daily
// ---------------------------------------------------------------------------
async function runAnafCheck() {
  console.log("[cron] [1/5] Starting ANAF check...");

  const companies = await prisma.company.findMany({
    include: { user: true },
  });

  if (companies.length === 0) {
    console.log("[cron] No companies to check.");
    return;
  }

  const cuis = [...new Set(companies.map((c) => c.cui))];
  const anafResults = await fetchAnafData(cuis);
  const anafMap = new Map(anafResults.map((r) => [r.cui, r]));

  for (const company of companies) {
    try {
      const newAnaf = anafMap.get(company.cui);
      if (!newAnaf) continue;

      const prevAnaf = (company.dateAnaf as JsonObject) || {};
      const newAnafData = newAnaf as unknown as JsonObject;

      const monitoredFields = [
        "scpTVA",
        "statusInactivi",
        "statusEFactura",
        "adresa",
        "stare_inregistrare",
      ];
      const changes = diffObjects(prevAnaf, newAnafData, monitoredFields);

      if (changes.length > 0) {
        const isUrgent = changes.some(
          (c) => c.field === "statusInactivi" && c.newValue === "true"
        );

        await prisma.alert.create({
          data: {
            companyId: company.id,
            userId: company.userId,
            tipAlerta: isUrgent ? "URGENT" : "MODIFICARE",
            detalii: { changes, source: "ANAF" },
          },
        });

        if (isUrgent) {
          await sendUrgentAlertEmail(
            company.user.email,
            company.nume,
            "Firma declarata inactiva fiscal",
            `Firma ${company.nume} (CUI: ${company.cui}) a fost declarata inactiva fiscal in ANAF.`
          );
        } else {
          await sendAlertEmail(
            company.user.email,
            company.nume,
            changes,
            company.id
          );
        }
      }

      await prisma.company.update({
        where: { id: company.id },
        data: {
          dateAnaf: JSON.parse(JSON.stringify(newAnafData)),
          lastChecked: new Date(),
        },
      });
    } catch (err) {
      console.error(`[cron] Error processing ANAF for ${company.cui}:`, err);
    }
  }

  console.log("[cron] [1/5] ANAF check complete.");
}

// ---------------------------------------------------------------------------
// 2. BPI — runs daily
// ---------------------------------------------------------------------------
async function runBpiCheck() {
  console.log("[cron] [2/5] Starting BPI insolvency check...");

  const companies = await prisma.company.findMany({
    include: { user: true },
  });

  if (companies.length === 0) return;

  const cuis = [...new Set(companies.map((c) => c.cui))];
  const matches = await checkBpiInsolvencies(cuis);

  for (const match of matches) {
    const company = companies.find(
      (c) => c.cui.replace(/\D/g, "") === match.cui.replace(/\D/g, "")
    );
    if (!company) continue;

    // Avoid duplicate alert if we already alerted today
    const existing = await prisma.alert.findFirst({
      where: {
        companyId: company.id,
        tipAlerta: "INSOLVENTA",
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    if (existing) continue;

    await prisma.alert.create({
      data: {
        companyId: company.id,
        userId: company.userId,
        tipAlerta: "INSOLVENTA",
        detalii: {
          source: "BPI",
          tipProcedura: match.tipProcedura,
          numarDosar: match.numarDosar,
          tribunal: match.tribunal,
          dataPublicare: match.dataPublicare,
        },
      },
    });

    await sendUrgentAlertEmail(
      company.user.email,
      company.nume,
      `Procedura de insolventa: ${match.tipProcedura}`,
      `Firma ${company.nume} (CUI: ${company.cui}) a aparut in Buletinul Procedurilor de Insolventa.
Tip procedura: ${match.tipProcedura}
Numar dosar: ${match.numarDosar}
Tribunal: ${match.tribunal}
Data publicare: ${match.dataPublicare}`
    );

    // Persist BPI hit
    const prevBpi = (company.dateBpi as JsonObject) || {};
    await prisma.company.update({
      where: { id: company.id },
      data: {
        dateBpi: {
          ...(prevBpi as object),
          lastInsolventa: {
            tipProcedura: match.tipProcedura,
            numarDosar: match.numarDosar,
            data: match.dataPublicare,
          },
        },
      },
    });
  }

  console.log(`[cron] [2/5] BPI check complete. Matches: ${matches.length}`);
}

// ---------------------------------------------------------------------------
// 3. ONRC — runs weekly (Monday)
// ---------------------------------------------------------------------------
async function runOnrcMonitoring() {
  console.log("[cron] [3/5] Starting ONRC check...");

  const companiesWithChanges = await runOnrcCheck();

  // Load user emails for affected companies
  for (const item of companiesWithChanges) {
    const company = await prisma.company.findUnique({
      where: { id: item.companyId },
      include: { user: true },
    });
    if (!company) continue;

    await prisma.alert.create({
      data: {
        companyId: company.id,
        userId: company.userId,
        tipAlerta: "MODIFICARE_ONRC",
        detalii: { changes: item.changes, source: "ONRC" },
      },
    });

    await sendAlertEmail(
      company.user.email,
      company.nume,
      item.changes,
      company.id
    );
  }

  console.log(`[cron] [3/5] ONRC check complete. Changes: ${companiesWithChanges.length}`);
}

// ---------------------------------------------------------------------------
// 4. MF Bilant — runs monthly (first day of month)
// ---------------------------------------------------------------------------
async function runMfMonitoring() {
  console.log("[cron] [4/5] Starting MF bilant check...");

  const companiesWithChanges = await runMfBilantCheck();

  for (const item of companiesWithChanges) {
    const company = await prisma.company.findUnique({
      where: { id: item.companyId },
      include: { user: true },
    });
    if (!company) continue;

    await prisma.alert.create({
      data: {
        companyId: company.id,
        userId: company.userId,
        tipAlerta: "MODIFICARE_BILANT",
        detalii: { changes: item.changes, source: "MF_BILANT" },
      },
    });

    await sendAlertEmail(
      company.user.email,
      company.nume,
      item.changes,
      company.id
    );
  }

  console.log(`[cron] [4/5] MF bilant check complete. Changes: ${companiesWithChanges.length}`);
}

// ---------------------------------------------------------------------------
// 5. ANAF Datornici — runs monthly (first day of month)
// ---------------------------------------------------------------------------
async function runDatornicMonitoring() {
  console.log("[cron] [5/5] Starting ANAF datornici check...");

  const matches = await runDatornicCheck();

  for (const item of matches) {
    const company = await prisma.company.findUnique({
      where: { id: item.companyId },
      include: { user: true },
    });
    if (!company) continue;

    await prisma.alert.create({
      data: {
        companyId: company.id,
        userId: company.userId,
        tipAlerta: "DATORNIC",
        detalii: {
          source: "ANAF_DATORNICI",
          sumaRestanta: item.record.sumaRestanta,
          localitate: item.record.localitate,
          judet: item.record.judet,
        },
      },
    });

    await sendUrgentAlertEmail(
      company.user.email,
      company.nume,
      "Firma publicata pe lista datornicilor ANAF",
      `Firma ${company.nume} (CUI: ${company.cui}) apare pe lista datornicilor publicata de ANAF.
Suma restanta: ${item.record.sumaRestanta.toLocaleString("ro-RO")} RON
Localitate: ${item.record.localitate || "—"}
Judet: ${item.record.judet || "—"}`
    );
  }

  console.log(`[cron] [5/5] Datornici check complete. Matches: ${matches.length}`);
}

// ---------------------------------------------------------------------------
// Trial expiry check — runs daily alongside ANAF
// ---------------------------------------------------------------------------
async function checkTrialExpiry() {
  const twelveDaysAgo = new Date();
  twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12);

  const thirteenDaysAgo = new Date();
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

  const expiringUsers = await prisma.user.findMany({
    where: {
      subscriptionStatus: "trial",
      trialStart: {
        gte: thirteenDaysAgo,
        lte: twelveDaysAgo,
      },
    },
  });

  for (const user of expiringUsers) {
    await sendTrialExpiryReminder(user.email, user.name || undefined);
  }

  console.log(`[cron] Trial expiry: notified ${expiringUsers.length} users`);
}

// ---------------------------------------------------------------------------
// Main entry points called by the cron route
// ---------------------------------------------------------------------------

/**
 * Runs every day at 06:00 (called by GET /api/cron).
 * Always runs: ANAF + BPI + trial expiry check.
 * On Monday: also runs ONRC.
 * On 1st of month: also runs MF bilant + datornici.
 */
export async function runDailyMonitoring() {
  console.log("[cron] ===== Daily monitoring started =====");
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
  const dayOfMonth = now.getDate();

  // 1. ANAF — always daily
  await runAnafCheck();

  // 2. BPI — always daily
  await runBpiCheck();

  // 3. ONRC — weekly on Monday
  if (dayOfWeek === 1) {
    await runOnrcMonitoring();
  } else {
    console.log("[cron] [3/5] ONRC skipped (not Monday)");
  }

  // 4 & 5. MF Bilant + Datornici — monthly on the 1st
  if (dayOfMonth === 1) {
    await runMfMonitoring();
    await runDatornicMonitoring();
  } else {
    console.log("[cron] [4/5] MF bilant skipped (not 1st of month)");
    console.log("[cron] [5/5] Datornici skipped (not 1st of month)");
  }

  // Trial expiry
  await checkTrialExpiry();

  console.log("[cron] ===== Daily monitoring completed =====");
}

/**
 * Force-runs all sources regardless of day (for manual triggers / testing).
 */
export async function runFullMonitoring() {
  console.log("[cron] ===== Full monitoring (forced) started =====");
  await runAnafCheck();
  await runBpiCheck();
  await runOnrcMonitoring();
  await runMfMonitoring();
  await runDatornicMonitoring();
  await checkTrialExpiry();
  console.log("[cron] ===== Full monitoring (forced) completed =====");
}
