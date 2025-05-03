"use client";
import React from "react";
import type { FC, JSX } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStatCards } from "./DashboardStatCards";
import { DashboardAnalyticsChart } from "./DashboardAnalyticsChart";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import { DashboardQuickActions } from "./DashboardQuickActions";

/**
 * DashboardLayout composes the main dashboard sections in a Datta Able-like layout with sidebar.
 * @returns {JSX.Element} The dashboard layout.
 */
export const DashboardLayout: FC = (): JSX.Element => {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col gap-6 mt-4 p-4 bg-muted/50">
        <DashboardStatCards />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <DashboardAnalyticsChart />
            <DashboardRecentActivity />
          </div>
          <DashboardQuickActions />
        </div>
      </main>
    </div>
  );
};
