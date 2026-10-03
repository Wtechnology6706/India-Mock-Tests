import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserForToken } from "../../lib/auth-store";
import { getUserDashboardData } from "../../lib/dashboard-store";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);
  if (!user) redirect("/login");

  const initialData = await getUserDashboardData(user);

  return <DashboardClient user={user} initialData={initialData} />;
}

