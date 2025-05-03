"use client";

import React from "react";
import type { JSX } from "react";
import { useElections } from "@/context/ElectionsContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F"];

type AnalyticsProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Analytics displays analytics cards for each election with charts and statistics.
 * @param {AnalyticsProps} props - Additional HTML attributes for the root div.
 * @returns {JSX.Element} The analytics dashboard section.
 */
export function Analytics(props: AnalyticsProps): JSX.Element {
  const { elections, loading, error } = useElections();

  // Render a card for each election, with pie chart and respective bar charts below
  const electionCards = React.useMemo(() => {
    if (!elections || !Array.isArray(elections)) return null;
    return elections.map((election: any) => {
      // Pie data for this election
      const candidateCount = Array.isArray(election.candidates)
        ? election.candidates.length
        : 0;
      const voterCount = Array.isArray(election.votes)
        ? election.votes.length
        : 0;
      const pieData = [
        { name: "Candidates", value: candidateCount },
        { name: "Voters", value: voterCount },
      ];
      // Build position bar charts for this election
      const positions = Array.isArray(election.positions)
        ? election.positions
        : [];
      const candidates = Array.isArray(election.candidates)
        ? election.candidates
        : [];
      const votes = Array.isArray(election.votes) ? election.votes : [];
      return (
        <Card
          key={election.id}
          className="mb-8 shadow-lg border border-gray-200 dark:border-gray-800"
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold">{election.name}</CardTitle>
            <div className="text-gray-500 text-sm">{election.description}</div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 flex flex-col gap-8">
                {positions.map((position: any) => {
                  // Candidates for this position
                  const positionCandidates = candidates.filter(
                    (cand: any) => cand.positionId === position.id
                  );
                  // Votes per candidate
                  const candidateVoteData = positionCandidates.map(
                    (cand: any) => ({
                      name: cand.name,
                      votes: votes.filter(
                        (vote: any) => vote.candidateId === cand.id
                      ).length,
                    })
                  );
                  return (
                    <div
                      key={position.id}
                      className="mb-4 w-full max-w-xs mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow"
                    >
                      <h4 className="font-semibold text-center mb-2 text-lg text-primary-700 dark:text-primary-300">
                        {position.name}
                      </h4>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart
                          data={candidateVoteData}
                          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                          barCategoryGap={16}
                        >
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            domain={[0, "dataMax + 5"]}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fontSize: 13 }}
                          />
                          <Legend />
                          <Tooltip />
                          <Bar
                            dataKey="votes"
                            fill="#8884d8"
                            name="Votes"
                            maxBarSize={28}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });
  }, [elections]);

  return (
    <div className="space-y-8">
      <Card {...props}>
        <CardHeader>
          <CardTitle>Election Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading analytics...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Render all election cards below the main pie chart */}
              {electionCards}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
