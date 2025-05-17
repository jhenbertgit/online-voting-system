import { checkRole } from "@/lib/role";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/shared/layouts/DashboardLayout";

export default async function DashboardPage() {
  const isAdmin = await checkRole("admin");

  if (!isAdmin) {
    redirect("/");
  }

  return <DashboardLayout />;
}
