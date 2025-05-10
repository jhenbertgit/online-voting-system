"use client";
import React from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardStatCards } from "./DashboardStatCards";
import { DashboardAnalyticsChart } from "./DashboardAnalyticsChart";
import { DashboardRecentActivity } from "./DashboardRecentActivity";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { WalletConnectCard } from "./WalletConnectCard";
import { useAccount } from "wagmi";

/**
 * DashboardLayout composes the main dashboard sections in layout with sidebar.
 * @returns {JSX.Element} The dashboard layout.
 */
export const DashboardLayout: React.FC = (): React.JSX.Element => {
  const { isConnected } = useAccount();
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col gap-6 mt-4 p-4 bg-muted/50 mb-5">
          <DashboardStatCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">
              <DashboardAnalyticsChart />
            </div>
            <div className="flex flex-col gap-4 h-full">
              <WalletConnectCard />
              {isConnected && <DashboardQuickActions />}
            </div>
            <div className="lg:col-span-3 flex flex-col gap-4 h-full">
              <DashboardRecentActivity />
            </div>
          </div>
        </main>
        <footer className="py-6 border-t">
          <div className="text-center text-sm text-gray-500">
            2025 VoteGuard. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};
