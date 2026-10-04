import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserForToken, updateUserSubscription, SubscriptionTier } from "../../../../lib/auth-store";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("northstar_session")?.value;
    const user = await getUserForToken(token);

    if (!user) {
      return NextResponse.json({ error: "Please log in to activate a subscription." }, { status: 401 });
    }

    const body = await request.json();
    const tier: SubscriptionTier = body.tier === "ultimate" ? "ultimate" : (body.tier === "sprint" ? "sprint" : "free");
    const durationDays = body.billingCycle === "annual" ? 365 : (body.billingCycle === "quarterly" ? 90 : 30);
    const targetExamSlug = tier === "sprint" ? (body.targetExamSlug || "bpsc-tre-4") : null;
    const targetExamName = tier === "sprint" ? (body.targetExamName || "BPSC TRE 4.0") : null;

    const result = await updateUserSubscription(user.id, tier, durationDays, targetExamSlug, targetExamName);

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${tier === "ultimate" ? "All-Exam Ultimate Pass" : (tier === "sprint" ? `Single Exam Sprint (${targetExamName})` : "Free Aspirant")}`,
      subscriptionTier: result.tier,
      expiresAt: result.expiresAt,
      targetExamSlug: result.targetExamSlug,
      targetExamName: result.targetExamName,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process subscription." }, { status: 500 });
  }
}
