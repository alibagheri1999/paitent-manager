"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { ExportButton } from "@/components/ui/export-button";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-in-right">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600 animate-slide-in-right animation-delay-500">View comprehensive reports and insights</p>
          </div>
          <div className="animate-slide-in-left animation-delay-500">
            <ExportButton
              exportType="analytics"
              filename="analytics_export"
              variant="outline"
              className="w-full sm:w-auto hover-lift hover:animate-wiggle"
            >
              Export Analytics
            </ExportButton>
          </div>
        </div>

        <div className="animate-bounce-in animation-delay-1000">
          <AnalyticsDashboard />
        </div>
      </div>
    </DashboardLayout>
  );
}
