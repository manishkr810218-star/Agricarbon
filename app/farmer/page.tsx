import { redirect } from "next/navigation";
import FarmerPortal from "@/components/FarmerPortal";
import { userFromPageCookie } from "@/lib/server/auth";

export const runtime = "nodejs";

export default async function FarmerPage() {
  const user = await userFromPageCookie();
  if (!user) redirect("/login");
  return <FarmerPortal user={user} />;
}
