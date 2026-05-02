import { prisma } from "./prisma";
import { fetchFirmeByCodes } from "./firmeapi";
import {
  sendAlertEmail,
  sendUrgentAlertEmail,
  sendTrialExpiryReminder,
} from "./resend";

type JsonObject = Record<string, unknown>;

type Priority = "URGENT" | "IMPORTANT" | "INFO";

const URGENT_FIELDS = ["inactiv", "insolventa"] as const;
const IMPORTANT_FIELDS = ["tva", "administrator"] as const;
const INFO_FIELDS = ["adresa", "cod_caen", "stare"] as const;
const ALL_MONITORED = [...URGENT_FIELDS, ...IMPORTANT_FIELDS, ...INFO_FIELDS];

function diffObjects(
  prev: JsonObject,
  curr: JsonObject
): { field: string; oldValue: string; newValue: string; priority: Priority }[] {
  const changes: { field: string; oldValue: string; newValue: string; priority: Priority }[] = [];
  for (const field of ALL_MONITORED) {
    const oldVal = String(prev[field] ?? "");
    const newVal = String(curr[field] ?? "");
    if (oldVal !== newVal) {
      const priority: Priority = (URGENT_FIELDS as readonly string[]).includes(field)
        ? "URGENT"
        : (IMPORTANT_FIELDS as readonly string[]).includes(field)
        ? "IMPORTANT"
        : "INFO";
      changes.push({ field, oldValue: oldVal, newValue: newVal, priority });
    }
  }
  return changes;
}

function topPriority(changes: { priority: Priority }[]): Priority {
  if (changes.some((c) => c.priority === "URGENT")) return "URGENT";
  if (changes.some((c) => c.priority === "IMPORTANT")) return "IMPORTANT";
  return "INFO";
}

// Maps legacy ANAF field names to FirmeAPI field names so the first cron
// run after migration doesn't generate false-positive alerts.
function migrateAnafToFirma(data: JsonObject): JsonObject {
  if (!("scpTVA" in data)) return data;
  return {
    cui: data.cui,
    denumire: data.denumire,
    adresa: data.adresa,
    stare: data.stare_inregistrare ?? "",
    tva: data.scpTVA ?? false,
    cod_caen: "",
    denumire_caen: "",
    administrator: "",
    inactiv: data.statusInactivi ?? false,
    insolventa: false,
  };
}

async function checkTrialExpiry() {
  const twelveDaysAgo = new Date();
  twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12);

  const thirteenDaysAgo = new Date();
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

  const expiringUsers = await prisma.user.findMany({
    where: {
      subscriptionStatus: "trial",
      trialStart: { gte: thirteenDaysAgo, lte: twelveDaysAgo },
    },
  });

  for (const user of expiringUsers) {
    await sendTrialExpiryReminder(user.email, user.name || undefined);
  }

  console.log(`[cron] Trial expiry: notified ${expiringUsers.length} users`);
}

export async function runDailyMonitoring() {
  console.log("[cron] ===== Daily monitoring started =====");

  const companies = await prisma.company.findMany({ include: { user: true } });
  if (companies.length === 0) {
    console.log("[cron] No companies to check.");
    await checkTrialExpiry();
    return;
  }

  const cuis = [...new Set(companies.map((c) => c.cui))];
  const firmaMap = await fetchFirmeByCodes(cuis);

  for (const company of companies) {
    try {
      const newData = firmaMap.get(company.cui);
      if (!newData) continue;

      const prevRaw = (company.dateAnaf as JsonObject) || {};
      const prevData = migrateAnafToFirma(prevRaw);
      const newDataObj = newData as unknown as JsonObject;

      const changes = diffObjects(prevData, newDataObj);
      if (changes.length > 0) {
        const alertType = topPriority(changes);

        await prisma.alert.create({
          data: {
            companyId: company.id,
            userId: company.userId,
            tipAlerta: alertType,
            detalii: { changes, source: "FirmeAPI" },
          },
        });

        if (alertType === "URGENT") {
          const urgentReasons = changes
            .filter((c) => c.priority === "URGENT")
            .map((c) => {
              if (c.field === "inactiv" && c.newValue === "true") return "Firma declarată inactivă";
              if (c.field === "insolventa" && c.newValue === "true") return "Firma în insolvență";
              return `${c.field}: ${c.oldValue} → ${c.newValue}`;
            })
            .join("; ");

          await sendUrgentAlertEmail(
            company.user.email,
            company.nume,
            "Alertă urgentă — firmă în risc",
            urgentReasons
          );
        } else {
          await sendAlertEmail(
            company.user.email,
            company.nume,
            changes,
            company.id,
            alertType
          );
        }
      }

      await prisma.company.update({
        where: { id: company.id },
        data: {
          dateAnaf: JSON.parse(JSON.stringify(newDataObj)),
          lastChecked: new Date(),
        },
      });
    } catch (err) {
      console.error(`[cron] Error processing company ${company.cui}:`, err);
    }
  }

  await checkTrialExpiry();
  console.log("[cron] ===== Daily monitoring completed =====");
}

export async function runFullMonitoring() {
  return runDailyMonitoring();
}
