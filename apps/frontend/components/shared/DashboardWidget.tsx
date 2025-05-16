"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type DashboardWidgetProps = {
  /** Title of the widget */
  title: string;
  /** Value to display (main stat) */
  value: string | number;
  /** Optional: Description or subtitle */
  description?: string;
  /** Optional: Icon element (ReactNode) */
  icon?: React.ReactNode;
  /** Optional: Tailwind className for custom styling */
  className?: string;
};

/**
 * DashboardWidget displays a summary card for dashboard stats.
 *
 * @param {DashboardWidgetProps} props - The properties for the widget.
 * @returns {JSX.Element} The dashboard widget component.
 */
export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  description,
  icon,
  className = "",
}: DashboardWidgetProps): React.JSX.Element => {
  return (
    <Card
      className={`flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        {icon && <div className="text-2xl text-primary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary mb-1">{value}</div>
        {description && (
          <div className="text-xs text-muted-foreground mb-2">
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
