import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserForToken } from "../../../../lib/auth-store";
import { getSiteConfiguration, saveSiteConfiguration } from "../../../../lib/site-config";

export async function GET() {
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  const config = await getSiteConfiguration();
  return NextResponse.json({ config });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await saveSiteConfiguration(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update configuration" },
      { status: 500 }
    );
  }
}
