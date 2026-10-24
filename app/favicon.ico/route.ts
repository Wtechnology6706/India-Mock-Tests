import { NextResponse } from "next/server";
import { getSiteConfiguration } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getSiteConfiguration();
    if (config?.logoImageUrl && config.logoImageUrl.trim()) {
      const targetUrl = config.logoImageUrl.startsWith("http")
        ? config.logoImageUrl
        : `https://sarkaripractice.com${config.logoImageUrl}`;
      return NextResponse.redirect(new URL(targetUrl), 307);
    }
  } catch (err) {
    console.error("Error in favicon route:", err);
  }

  // Fallback 1x1 transparent or standard empty response
  return new NextResponse(null, { status: 404 });
}
