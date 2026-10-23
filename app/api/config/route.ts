import { NextResponse } from "next/server";
import { getSiteConfiguration } from "../../../lib/site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = await getSiteConfiguration();
  return NextResponse.json(
    { config },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

