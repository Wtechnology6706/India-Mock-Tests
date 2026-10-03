import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserForToken } from "../../../../lib/auth-store";
import { getUserDashboardData } from "../../../../lib/dashboard-store";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("northstar_session")?.value;
    const user = await getUserForToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getUserDashboardData(user);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
