"use client";
import React from "react";
import type { FC, JSX } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Home, BarChart2, Settings } from "lucide-react";

// You can move this to a constants file if you want to reuse it elsewhere
const navLinks = [
  {
    label: "Dashboard",
    route: "/admin",
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: "Reports",
    route: "/admin/reports",
    icon: <BarChart2 className="w-5 h-5" />,
  },
  {
    label: "Settings",
    route: "/admin/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

/**
 * DashboardSidebar displays the admin sidebar with navigation links and user profile.
 * Highlights the active route and docks the user button at the bottom.
 * @returns {JSX.Element} The sidebar component.
 */
export const DashboardSidebar: FC = (): JSX.Element => {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col shadow-sm">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
          <BarChart2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-wide">VoteGuard</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col">
        <SignedIn>
          <ul className="flex flex-col gap-1 flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.route;
              return (
                <li key={link.route}>
                  <Link
                    href={link.route}
                    className={`flex items-center gap-3 px-3 py-2 rounded transition font-medium ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto">
            <hr className="my-4 border-muted" />
            <div className="px-4 pb-6">
              <UserButton
                afterSwitchSessionUrl="/"
                showName
                appearance={{
                  elements: {
                    rootBox: "flex items-center gap-3 w-full",
                    avatarBox: "h-10 w-10",
                    username: "p-16-semibold text-gray-700",
                  },
                }}
              />
            </div>
          </div>
        </SignedIn>
      </nav>
    </aside>
  );
};
