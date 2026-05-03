import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/login");
  }

  if (!session) redirect("/login");

  const user = {
    email: session.user?.email ?? "",
    name: session.user?.name ?? null,
    role: (session.user as { role?: string })?.role ?? "user",
    subscriptionStatus: (session.user as { subscriptionStatus?: string })?.subscriptionStatus ?? "trial",
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
