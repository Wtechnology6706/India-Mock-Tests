import { NextResponse } from "next/server";
import { getSiteConfiguration } from "../../../lib/site-config";

export async function GET() {
  const config = await getSiteConfiguration();
  return NextResponse.json({ config });
}
