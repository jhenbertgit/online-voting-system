"use client";
import React from "react";
import type { FC, JSX } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus, UserPlus, BarChart } from "lucide-react";

/**
 * DashboardQuickActions displays shortcut buttons for quick actions.
 * @returns {JSX.Element} The quick actions card.
 */
export const DashboardQuickActions: FC = (): JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-medium text-muted-foreground">
          Quick Actions
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> New Election
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/80 transition">
            <BarChart className="w-4 h-4" /> View Stats
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
