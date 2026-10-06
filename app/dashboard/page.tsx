import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserForToken } from "../../lib/auth-store";
import { getUserDashboardData } from "../../lib/dashboard-store";
import { listMockTests } from "../../lib/admin-content";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);
  if (!user) redirect("/login");

  const [initialData, publishedTests] = await Promise.all([
    getUserDashboardData(user),
    listMockTests({ status: "Published" }),
  ]);

  return <DashboardClient user={user} initialData={initialData} initialMockTests={publishedTests} />;
}


