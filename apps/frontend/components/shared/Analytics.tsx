"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

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

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
];

type AnalyticsProps = React.HTMLAttributes<HTMLDivElement>;

export function Analytics(props: AnalyticsProps): React.JSX.Element {
  // Sanitize props if you later accept user input
  const safeProps = sanitizeAnalyticsProps(props);

  // Memoize chart components for performance
  const memoizedBarChart = React.useMemo(
    () => (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    ),
    []
  );

  return (
    <Card {...safeProps}>
      <CardHeader>
        <CardTitle>Election Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" aria-label="Election Analytics Bar Chart">
          {memoizedBarChart}
        </div>
      </CardContent>
    </Card>
  );
}
