"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { ExportButton } from "@/components/ui/export-button";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">View comprehensive reports and insights</p>
          </div>
          <ExportButton
            exportType="analytics"
            filename="analytics_export"
            variant="outline"
          >
            Export Analytics
          </ExportButton>
        </div>

        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}
