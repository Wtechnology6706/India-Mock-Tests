import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-store";
import { getOrCreateWallet, getUserWalletTransactions } from "@/lib/wallet-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Please sign in to view wallet." }, { status: 401 });
    }

    const wallet = await getOrCreateWallet(user.id);
    const transactions = await getUserWalletTransactions(user.id, 20);

    return NextResponse.json({
      success: true,
      wallet,
      transactions,
    });
  } catch (error: any) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
