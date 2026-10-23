import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserForToken } from "../../lib/auth-store";
import AuthForm from "../auth/AuthForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("northstar_session")?.value;
  const user = await getUserForToken(sessionToken);

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return <AuthForm mode="login" />;
}
