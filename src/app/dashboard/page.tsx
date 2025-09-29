"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayAppointments } from "@/components/dashboard/recent-appointments";
import { TomorrowAppointments } from "@/components/dashboard/upcoming-appointments";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-bounce-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-in-right">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 animate-slide-in-right animation-delay-500">Welcome to your dental clinic management system</p>
        </div>
        
        <div className="animate-bounce-in animation-delay-500">
          <StatsCards />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 animate-fade-in animation-delay-1000">
          <div className="animate-slide-in-from-left animation-delay-1200">
            <TodayAppointments />
          </div>
          <div className="animate-slide-in-from-right animation-delay-1400">
            <TomorrowAppointments />
          </div>
        </div>
        
        <div className="animate-bounce-in animation-delay-1600">
          <RevenueChart />
        </div>
      </div>
    </DashboardLayout>
  );
}
