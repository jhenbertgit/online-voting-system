import { Analytics } from "@/components/shared/Analytics";
import { CreateElection } from "@/components/shared/CreateElection";
import { RecentElections } from "@/components/shared/RecentElections";
import { checkRole } from "@/lib/role";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const isAdmin = await checkRole("admin");

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 mt-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <CreateElection />
      </div>
      <Analytics />
      <RecentElections />
    </div>
  );
}
