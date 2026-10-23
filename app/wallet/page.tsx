import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserForToken } from "../../lib/auth-store";

export default async function WalletPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("northstar_session")?.value;
  const user = await getUserForToken(sessionToken);

  if (!user) {
    redirect("/login?redirect=/wallet");
  }

  // Redirect directly into the student dashboard's dedicated wallet tab
  redirect("/dashboard#wallet");
}
