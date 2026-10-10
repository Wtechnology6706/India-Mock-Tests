import { NextRequest, NextResponse } from "next/server";
import { getPYQById, updatePYQ, deletePYQ } from "@/lib/pyq-store";
import { getCurrentUser } from "@/lib/auth-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const pyq = await getPYQById(id);
    if (!pyq) {
      return NextResponse.json({ success: false, error: "PYQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, pyq });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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
    const updated = await updatePYQ(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "PYQ not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({ success: true, pyq: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await deletePYQ(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "PYQ not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
