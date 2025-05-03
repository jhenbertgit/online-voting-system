"use client";
import React, { useEffect, useState } from "react";
import type { FC, JSX } from "react";
import { DashboardWidget, DashboardWidgetProps } from "./DashboardWidget";
import { Users, UserCheck, Landmark, Building2 } from "lucide-react";
import { useElections } from "@/context";

/**
 * DashboardStatCards displays four key statistics as widgets.
 * @returns {JSX.Element} The stat cards row.
 */
export const DashboardStatCards: FC = (): JSX.Element => {
  const { elections, loading } = useElections();
  const [voterCount, setVoterCount] = useState<number | null>(null);
  const [voterLoading, setVoterLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVoterCount = async () => {
      setVoterLoading(true);
      try {
        const res = await fetch("/api/voters-count");
        const data = await res.json();
        setVoterCount(data.count);
      } catch {
        setVoterCount(null);
      } finally {
        setVoterLoading(false);
      }
    };
    fetchVoterCount();
  }, []);

  // Calculate total candidates
  const totalCandidates: number = elections.reduce(
    (sum, election) => sum + election.candidates.length,
    0
  );

  // Calculate total positions
  const totalPositions: number = elections.reduce(
    (sum, election) => sum + election.positions.length,
    0
  );

  // Calculate total party lists registered
  const totalPartyLists: number = elections.reduce(
    (sum, election) =>
      sum +
      election.positions.filter(
        (pos) => pos.name.toLowerCase() === "party list"
      ).length,
    0
  );

  // You can add more statistics as needed
  const stats: DashboardWidgetProps[] = [
    {
      title: "Candidates Registered",
      value: loading ? "Loading..." : totalCandidates.toLocaleString(),
      description: "Registered individual candidates",
      icon: (
        <UserCheck className="w-9 h-9 text-blue-600 bg-blue-100 rounded-full p-2" />
      ),
    },
    {
      title: "Voters Registered",
      value: voterLoading
        ? "Loading..."
        : voterCount !== null
          ? voterCount.toLocaleString()
          : "Error",
      description: "Registered voters",
      icon: (
        <Users className="w-9 h-9 text-green-600 bg-green-100 rounded-full p-2" />
      ),
    },
    {
      title: "Positions Avaliable",
      value: loading ? "Loading..." : totalPositions.toLocaleString(),
      description: "Elective positions available",
      icon: (
        <Landmark className="w-9 h-9 text-yellow-600 bg-yellow-100 rounded-full p-2" />
      ),
    },
    {
      title: "Party Lists Registered",
      value: loading ? "Loading..." : totalPartyLists.toLocaleString(),
      description: "Registered party lists",
      icon: (
        <Building2 className="w-9 h-9 text-pink-600 bg-pink-100 rounded-full p-2" />
      ),
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
