"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * DashboardAnalyticsChart displays a bar chart for voter turnout by election.
 * @returns {React.JSX.Element} The analytics chart card.
 */
export const DashboardAnalyticsChart: React.FC = (): React.JSX.Element => {
  // Example/mock data for voter turnout by election
  const turnoutData = [
    { electionName: "2024 Board", turnoutPercent: 82 },
    { electionName: "2025 Student Gov", turnoutPercent: 67 },
    { electionName: "2025 HOA", turnoutPercent: 74 },
    { electionName: "2025 PTA", turnoutPercent: 59 },
  ];

  return (
    <Card className="w-full bg-white border shadow-sm rounded-xl">
      <CardHeader className="pb-2">
        <div className="text-lg font-semibold text-gray-800">
          Voter Turnout by Election
        </div>
        <div className="text-xs text-muted-foreground">
          Percentage of eligible voters who participated in each election
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={turnoutData} barCategoryGap={24}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="electionName" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar
                dataKey="turnoutPercent"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
