import { prisma } from "./prisma";
import { fetchAnafData } from "./anaf";
import { sendAlertEmail, sendUrgentAlertEmail } from "./resend";

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

export async function runDailyMonitoring() {
  console.log("[cron] Starting daily monitoring...");

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

      const monitoredFields = ["scpTVA", "statusInactivi", "statusEFactura", "adresa", "stare_inregistrare"];
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
            "Firmă declarată inactivă fiscal",
            `Firma ${company.nume} (CUI: ${company.cui}) a fost declarată inactivă fiscal în ANAF.`
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

      if (newAnaf.statusInactivi && !prevAnaf.statusInactivi) {
        await sendUrgentAlertEmail(
          company.user.email,
          company.nume,
          "Inactivitate fiscală detectată",
          `Firma a intrat în evidența contribuabililor inactivi.`
        );
      }

      await prisma.company.update({
        where: { id: company.id },
        data: {
          dateAnaf: JSON.parse(JSON.stringify(newAnafData)),
          lastChecked: new Date(),
        },
      });
    } catch (err) {
      console.error(`[cron] Error processing company ${company.cui}:`, err);
    }
  }

  await checkTrialExpiry();
  console.log("[cron] Daily monitoring completed.");
}

async function checkTrialExpiry() {
  const { sendTrialExpiryReminder } = await import("./resend");
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
}
