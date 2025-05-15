"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

/**
 * DashboardAnalyticsChart displays a bar chart for voter turnout by election.
 * @returns {React.JSX.Element} The analytics chart card.
 */
/**
 * DashboardAnalyticsChart displays a line chart for vote transmission per candidate.
 * Shows off-chain (database), on-chain, and successfully recorded votes using mock data.
 * @returns {React.JSX.Element} The analytics chart card.
 */
export const DashboardAnalyticsChart: React.FC = (): React.JSX.Element => {
  /**
   * Mock data illustrating the cumulative transmission of votes per candidate over time.
   * Each entry represents a timestamped event with cumulative counts for each stage.
   */
  interface VoteTransmissionTimeData {
    timestamp: string; // ISO date string
    Alice_offChain: number;
    Alice_onChain: number;
    Bob_offChain: number;
    Bob_onChain: number;
    Charlie_offChain: number;
    Charlie_onChain: number;
  }

  // Candidates
  const candidates: string[] = ["Alice", "Bob", "Charlie"];


  // Mock cumulative, upward trend data
  const voteData: VoteTransmissionTimeData[] = [
    {
      timestamp: "2025-05-15T09:00:00+08:00",
      Alice_offChain: 10,
      Alice_onChain: 0,
      Bob_offChain: 8,
      Bob_onChain: 0,
      Charlie_offChain: 5,
      Charlie_onChain: 0,
    },
    {
      timestamp: "2025-05-15T09:30:00+08:00",
      Alice_offChain: 30,
      Alice_onChain: 20,
      Bob_offChain: 18,
      Bob_onChain: 12,
      Charlie_offChain: 15,
      Charlie_onChain: 10,
    },
    {
      timestamp: "2025-05-15T10:00:00+08:00",
      Alice_offChain: 60,
      Alice_onChain: 50,
      Bob_offChain: 40,
      Bob_onChain: 32,
      Charlie_offChain: 30,
      Charlie_onChain: 25,
    },
    {
      timestamp: "2025-05-15T10:30:00+08:00",
      Alice_offChain: 90,
      Alice_onChain: 80,
      Bob_offChain: 70,
      Bob_onChain: 65,
      Charlie_offChain: 55,
      Charlie_onChain: 50,
    },
    {
      timestamp: "2025-05-15T11:00:00+08:00",
      Alice_offChain: 120,
      Alice_onChain: 115,
      Bob_offChain: 100,
      Bob_onChain: 98,
      Charlie_offChain: 80,
      Charlie_onChain: 77,
    },
  ];

  return (
    <Card className="w-full bg-white border shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <div className="text-lg font-semibold text-gray-800">
          Vote Transmission per Candidate
        </div>
        <div className="text-xs text-muted-foreground">
          Number of votes for each candidate at each transmission stage
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={voteData}
              margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                tickFormatter={(iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(iso) => `Time: ${new Date(iso as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              />
              <Legend />
              {/* Draw a line for off-chain and on-chain for each candidate, with discrepancy highlight */}
              {candidates.map((candidate, cIdx) => [
                <Line
                  key={`${candidate}_offChain`}
                  type="monotone"
                  dataKey={`${candidate}_offChain`}
                  stroke={["#6366f1", "#10b981", "#f59e42"][cIdx]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  name={`${candidate} (Off-chain)`}
                />,
                <Line
                  key={`${candidate}_onChain`}
                  type="monotone"
                  dataKey={`${candidate}_onChain`}
                  stroke={["#6366f1", "#10b981", "#f59e42"][cIdx]}
                  strokeDasharray="4 2"
                  strokeWidth={2}
                  name={`${candidate} (On-chain)`}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const offChain = payload[`${candidate}_offChain`];
                    const onChain = payload[`${candidate}_onChain`];
                    if (offChain !== onChain) {
                      return <circle cx={cx} cy={cy} r={7} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
                    }
                    return <circle cx={cx} cy={cy} r={3} fill={["#6366f1", "#10b981", "#f59e42"][cIdx]} />;
                  }}
                  activeDot={{ r: 7 }}
                />
              ])}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
