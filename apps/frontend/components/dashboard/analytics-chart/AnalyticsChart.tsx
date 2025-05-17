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
import { CHART_COLORS } from "./types";
import type { VoteTransmissionTimeData } from "./types";
import { useCandidates, useVoteTransmissionTimeData } from "./hooks";

/**
 * AnalyticsChart displays a line chart for vote transmission per candidate.
 * Shows off-chain (database), on-chain, and successfully recorded votes.
 * @returns {React.JSX.Element} The analytics chart card.
 */
export const AnalyticsChart: React.FC = (): React.JSX.Element => {
  const candidates = useCandidates();
  const voteData = useVoteTransmissionTimeData();

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
                tickFormatter={(iso) =>
                  new Date(iso).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                }
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(iso) =>
                  `Time: ${new Date(iso as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                }
              />
              <Legend />
              {/* Draw a line for off-chain and on-chain for each candidate, with discrepancy highlight */}
              {candidates.map((candidate, cIdx) => [
                <Line
                  key={`${candidate}_offChain`}
                  type="monotone"
                  dataKey={`${candidate}_offChain`}
                  stroke={CHART_COLORS[cIdx]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  name={`${candidate} (Off-chain)`}
                />,
                <Line
                  key={`${candidate}_onChain`}
                  type="monotone"
                  dataKey={`${candidate}_onChain`}
                  stroke={CHART_COLORS[cIdx]}
                  strokeDasharray="4 2"
                  strokeWidth={2}
                  name={`${candidate} (On-chain)`}
                  dot={(props: {
                    cx?: number;
                    cy?: number;
                    payload?: VoteTransmissionTimeData;
                  }) => {
                    const { cx, cy, payload } = props;
                    const offChain = payload
                      ? payload[`${candidate}_offChain`]
                      : 0;
                    const onChain = payload
                      ? payload[`${candidate}_onChain`]
                      : 0;
                    if (offChain !== onChain) {
                      return (
                        <circle
                          key={`${candidate}_mismatch_${cx}_${cy}`}
                          cx={cx}
                          cy={cy}
                          r={7}
                          fill="#ef4444"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return (
                      <circle
                        key={`${candidate}_match_${cx}_${cy}`}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={CHART_COLORS[cIdx]}
                      />
                    );
                  }}
                  activeDot={{ r: 7 }}
                />,
              ])}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
