import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = session?.role === "admin" || (adminEmail ? session?.email === adminEmail : false);
  if (!session || !isAdmin) redirect("/dashboard");
  return <AdminClient />;
}
