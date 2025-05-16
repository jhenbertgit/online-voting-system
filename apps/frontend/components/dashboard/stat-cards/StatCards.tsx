import React from "react";
import { DashboardWidget } from "@/components/shared/DashboardWidget";
import { UserCheck, Users, Landmark, Building2 } from "lucide-react";
import { useElections } from "@/contexts";
import { useVoterCount, useStatCalculations } from "./hooks";
import { StatCardData } from "./types";

/**
 * StatCards displays four key statistics as widgets.
 */
export const StatCards: React.FC = () => {
  const { elections, loading } = useElections();
  const { voterCount, voterLoading } = useVoterCount();
  const { totalCandidates, totalPositions, totalPartyLists } = useStatCalculations(elections);

  const stats: StatCardData[] = [
    {
      title: "Candidates Registered",
      value: loading ? "Loading..." : totalCandidates.toLocaleString(),
      description: "Registered individual candidates",
      icon: <UserCheck className="w-9 h-9 text-blue-600 bg-blue-100 rounded-full p-2" />,
    },
    {
      title: "Voters Registered",
      value: voterLoading
        ? "Loading..."
        : voterCount !== null
          ? voterCount.toLocaleString()
          : "Error",
      description: "Registered voters",
      icon: <Users className="w-9 h-9 text-green-600 bg-green-100 rounded-full p-2" />,
    },
    {
      title: "Positions Avaliable",
      value: loading ? "Loading..." : totalPositions.toLocaleString(),
      description: "Elective positions available",
      icon: <Landmark className="w-9 h-9 text-yellow-600 bg-yellow-100 rounded-full p-2" />,
    },
    {
      title: "Party Lists Registered",
      value: loading ? "Loading..." : totalPartyLists.toLocaleString(),
      description: "Registered party lists",
      icon: <Building2 className="w-9 h-9 text-pink-600 bg-pink-100 rounded-full p-2" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <DashboardWidget key={idx} {...stat} />
      ))}
    </div>
  );
};
