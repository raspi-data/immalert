import cron from "node-cron";
import { runDailyMonitoring } from "../lib/monitoring";

console.log("[cron] Cron service started");

// Daily at 06:00
cron.schedule("0 6 * * *", async () => {
  console.log("[cron] Running daily monitoring job...");
  try {
    await runDailyMonitoring();
  } catch (err) {
    console.error("[cron] Daily monitoring failed:", err);
  }
}, { timezone: "Europe/Bucharest" });

console.log("[cron] Scheduled: daily monitoring at 06:00 Europe/Bucharest");
