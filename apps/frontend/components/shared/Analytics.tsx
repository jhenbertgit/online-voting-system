"use client";

import React from "react";
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

// Sanitize and validate any props passed to Analytics if you later add user input features
function sanitizeAnalyticsProps(props: AnalyticsProps) {
  // Example: Only allow specific keys and sanitize values as needed
  const allowedProps: string[] = [];
  const sanitized: Record<string, unknown> = {};
  for (const key of allowedProps) {
    if (key in props) {
      sanitized[key] = (props as Record<string, unknown>)[key];
    }
  }
  return sanitized;
}

const COLORS = ["#0088FE", "#00C49F"];

type AnalyticsProps = React.HTMLAttributes<HTMLDivElement>;

export function Analytics(props: AnalyticsProps): React.JSX.Element {
  const { elections, loading, error } = useElections();
  const [pieData, setPieData] = React.useState([
    { name: "Candidates", value: 0 },
    { name: "Voters", value: 0 },
  ]);
  const [barChartData, setBarChartData] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Aggregate analytics from elections context
    let candidateCount = 0;
    let voterCount = 0;
    // Build a map of positionId to position name for lookup
    const positionIdToName: Record<string, string> = {};
    elections.forEach((election: any) => {
      if (Array.isArray(election.positions)) {
        election.positions.forEach((pos: any) => {
          positionIdToName[pos.id] = pos.name;
        });
      }
    });
    // Build a map of positionId to candidate array with vote counts
    const positionCandidatesMap: Record<
      string,
      { positionName: string; candidates: { name: string; votes: number }[] }
    > = {};
    Object.entries(positionIdToName).forEach(([positionId, positionName]) => {
      positionCandidatesMap[positionId] = { positionName, candidates: [] };
    });
    // Aggregate candidates into their positions
    elections.forEach((election: any) => {
      if (Array.isArray(election.candidates)) {
        election.candidates.forEach((candidate: any) => {
          const posId = candidate.positionId;
          if (posId && positionCandidatesMap[posId]) {
            positionCandidatesMap[posId].candidates.push({
              name: candidate.name,
              votes: 0,
            });
          }
        });
      }
    });
    // Count votes for each candidate
    elections.forEach((election: any) => {
      if (Array.isArray(election.votes)) {
        election.votes.forEach((vote: any) => {
          const posId = vote.positionId;
          const candId = vote.candidateId;
          if (posId && candId && positionCandidatesMap[posId]) {
            const cand = positionCandidatesMap[posId].candidates.find(
              (c) =>
                c.name ===
                election.candidates?.find((cand: any) => cand.id === candId)
                  ?.name
            );
            if (cand) {
              cand.votes += 1;
            }
          }
        });
      }
    });
    // For rendering, get an array of { positionName, candidates: [{name, votes}] }
    const chartsData = Object.values(positionCandidatesMap);
    candidateCount = chartsData.reduce(
      (sum, d) => sum + d.candidates.length,
      0
    );
    voterCount = chartsData.reduce(
      (sum, d) => sum + d.candidates.reduce((s, c) => s + c.votes, 0),
      0
    );
    setPieData([
      { name: "Candidates", value: candidateCount },
      { name: "Voters", value: voterCount },
    ]);
    setBarChartData(chartsData);
  }, [elections]);

  // Memoize donut chart for performance
  const memoizedPieChart = React.useMemo(
    () => (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
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
    ),
    [pieData]
  );

  // Render a bar chart for each position
  const positionBarCharts = React.useMemo(
    () =>
      barChartData.map((position) => (
        <div key={position.positionName} className="mb-8 w-full max-w-xs">
          <h4 className="font-semibold text-center mb-2 text-lg">
            {position.positionName}
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={position.candidates}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
              barCategoryGap={16}
            >
              <XAxis
                type="number"
                allowDecimals={false}
                domain={[0, "dataMax + 20"]}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 14 }}
              />
              <Legend />
              <Tooltip />
              <Bar
                dataKey="votes"
                fill="#8884d8"
                name="Votes"
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )),
    [barChartData]
  );

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="h-[300px] flex flex-col items-center justify-center"
              aria-label="Election Analytics Donut Chart"
            >
              {memoizedPieChart}
            </div>
            <div
              className="flex flex-col items-center justify-center w-full"
              aria-label="Election Results Overview Bar Charts"
            >
              {positionBarCharts}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
