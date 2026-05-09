import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = adminEmail ? session?.email === adminEmail : session?.role === "admin";
  if (!session || !isAdmin) redirect("/dashboard");
  return <AdminClient />;
}
