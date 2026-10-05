import { redirect } from "next/navigation";
import AuthScreen from "@/components/AuthScreen";
import { userFromPageCookie } from "@/lib/server/auth";

export const runtime = "nodejs";

export default async function LoginPage() {
  if (await userFromPageCookie()) redirect("/farmer");
  return <AuthScreen />;
}
