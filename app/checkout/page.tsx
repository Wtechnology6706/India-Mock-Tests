import { cookies } from "next/headers";
import { getUserForToken } from "../../lib/auth-store";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout & Payment Gateway | India Mock Tests VIP Pass",
  description: "Secure payment gateway for India Mock Tests preparation passes.",
};

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const user = await getUserForToken(cookieStore.get("northstar_session")?.value);

  return <CheckoutClient user={user} />;
}
