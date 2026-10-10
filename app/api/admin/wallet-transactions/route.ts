import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { getAllWalletTransactions } from "@/lib/wallet-store";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 100;
    const offset = Number(searchParams.get("offset")) || 0;

    const { transactions, total } = await getAllWalletTransactions(limit, offset);
    return NextResponse.json({ success: true, transactions, total });
  } catch (error: any) {
    console.error("Error fetching admin wallet transactions:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
