import { prisma } from "./prisma";
import { fetchFirmeByCodes, detectChanges, normalizeLegacyStoredState, type ChangePriority } from "./anaf";
import { sendAlertEmail, sendUrgentAlertEmail } from "./resend";

function topPriority(changes: { priority: ChangePriority }[]): ChangePriority {
  if (changes.some((c) => c.priority === "CRITIC")) return "CRITIC";
  if (changes.some((c) => c.priority === "IMPORTANT")) return "IMPORTANT";
  return "INFO";
}

export async function runDailyMonitoring() {
  console.log("[cron] ===== Daily monitoring started =====");

  const companies = await prisma.company.findMany({ include: { user: true } });

  if (companies.length === 0) {
    console.log("[cron] No companies.");
    return;
  }

  const cuis = [...new Set(companies.map((c) => c.cui))];
  const firmaMap = await fetchFirmeByCodes(cuis);

  for (const company of companies) {
    try {
      const newData = firmaMap.get(company.cui);
      if (!newData) {
        console.warn(`[cron] No ANAF data for CUI ${company.cui} — skipping`);
        continue;
      }

      const prevRaw = normalizeLegacyStoredState((company.dateAnaf as Record<string, unknown>) ?? {});
      const changes = detectChanges(prevRaw, newData);

      if (changes.length > 0) {
        const priority = topPriority(changes);

        await prisma.alert.create({
          data: {
            companyId: company.id,
            userId: company.userId,
            tipAlerta: priority,
            detalii: { changes, source: "ANAF-v9" } as object,
          },
        });

        const criticChanges = changes.filter((c) => c.priority === "CRITIC");
        const otherChanges = changes.filter((c) => c.priority !== "CRITIC");

        if (criticChanges.length > 0) {
          const reasons = criticChanges
            .map((c) => {
              if (c.field === "inactiv" && c.newValue === "true") return "Firma a fost declarată INACTIVĂ fiscal";
              if (c.field === "data_radiere" && c.newValue) return `Firma a fost RADIATĂ la ${c.newValue}`;
              return `${c.field}: ${c.oldValue} → ${c.newValue}`;
            })
            .join("; ");
          await sendUrgentAlertEmail(company.user.email, company.nume, "Alertă Critică ANAF", reasons);
        }

        if (otherChanges.length > 0) {
          await sendAlertEmail(
            company.user.email,
            company.nume,
            otherChanges,
            company.id,
            priority === "IMPORTANT" ? "IMPORTANT" : "INFO"
          );
        }

        console.log(`[cron] ${company.cui} (${company.nume}): ${changes.length} changes, priority=${priority}`);
      }

      await prisma.company.update({
        where: { id: company.id },
        data: { dateAnaf: JSON.parse(JSON.stringify(newData)), lastChecked: new Date() },
      });
    } catch (err) {
      console.error(`[cron] Error for CUI ${company.cui}:`, err);
    }
  }

  console.log("[cron] ===== Daily monitoring completed =====");
}

export async function runFullMonitoring() {
  return runDailyMonitoring();
}
