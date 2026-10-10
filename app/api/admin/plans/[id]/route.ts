import { NextRequest, NextResponse } from "next/server";
import { updateCommercePlan, getCommercePlanById } from "@/lib/commerce-store";
import { getCurrentUser } from "@/lib/auth-store";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateCommercePlan(id, {
      name: body.name,
      description: body.description,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      validityDays: body.validityDays !== undefined ? Number(body.validityDays) : undefined,
      features: body.features,
      active: body.active,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Plan not found or update failed." }, { status: 404 });
    }

    return NextResponse.json({ success: true, plan: updated });
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
