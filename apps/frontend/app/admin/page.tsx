import { Analytics } from "@/components/shared/Analytics";
import { CreateElection } from "@/components/shared/CreateElection";
import { RecentElections } from "@/components/shared/RecentElections";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <CreateElection />
      </div>
      <Analytics />
      <RecentElections />
    </div>
  );
}
