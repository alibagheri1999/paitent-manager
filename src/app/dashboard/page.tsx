"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your dental clinic management system</p>
        </div>
        
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentAppointments />
          <UpcomingAppointments />
        </div>
        
        <RevenueChart />
      </div>
    </DashboardLayout>
  );
}
