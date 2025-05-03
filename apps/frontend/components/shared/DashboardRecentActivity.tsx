"use client";
import React from "react";
import type { FC, JSX } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * DashboardRecentActivity displays a table of recent activities or transactions.
 * @returns {JSX.Element} The recent activity card.
 */
export const DashboardRecentActivity: FC = (): JSX.Element => {
  // Mock data
  const activities = [
    { id: 1, user: "Alice", action: "Created Election", date: "2025-05-01" },
    { id: 2, user: "Bob", action: "Voted", date: "2025-05-02" },
    { id: 3, user: "Charlie", action: "Closed Election", date: "2025-05-03" },
    { id: 4, user: "Diana", action: "Registered", date: "2025-05-03" },
  ];
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-medium text-muted-foreground">
          Recent Activity
        </div>
      </CardHeader>
      <CardContent>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 px-2">User</th>
              <th className="py-2 px-2">Action</th>
              <th className="py-2 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id} className="odd:bg-muted">
                <td className="py-2 px-2">{a.user}</td>
                <td className="py-2 px-2">{a.action}</td>
                <td className="py-2 px-2">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
