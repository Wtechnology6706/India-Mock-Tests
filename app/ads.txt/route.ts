import { NextResponse } from "next/server";
import { getSiteConfiguration } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getSiteConfiguration();
    const clientId = config?.adsenseClientId?.trim();

    if (clientId) {
      // Strip "ca-" if present to get pub-XXXXXXXXXXXXXXXX
      const pubId = clientId.startsWith("ca-") ? clientId.replace("ca-", "") : clientId;
      const content = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
      return new NextResponse(content, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (err) {
    console.error("Error generating ads.txt:", err);
  }

  return new NextResponse("# Google AdSense ads.txt placeholder\n# Configure your Google AdSense Client ID in the Admin Panel to activate.\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
