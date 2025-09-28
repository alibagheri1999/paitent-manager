"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TreatmentStats } from "@/components/analytics/treatment-stats";
import { PatientGrowth } from "@/components/analytics/patient-growth";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPatients: number;
  totalAppointments: number;
  averageAppointmentValue: number;
  topTreatments: Array<{
    treatmentType: string;
    count: number;
    revenue: number;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalPatients: 0,
    totalAppointments: 0,
    averageAppointmentValue: 0,
    topTreatments: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };

    fetchAnalytics();
  }, []);

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics.totalRevenue),
      description: "All-time revenue",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(analytics.monthlyRevenue),
      description: "This month's revenue",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Patients",
      value: analytics.totalPatients.toString(),
      description: "Registered patients",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Appointments",
      value: analytics.totalAppointments.toString(),
      description: "All appointments",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Average Value",
      value: formatCurrency(analytics.averageAppointmentValue),
      description: "Per appointment",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className={`h-6 w-6 ${stat.color}`}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <PatientGrowth />
      </div>

      {/* Treatment Statistics */}
      <TreatmentStats treatments={analytics.topTreatments} />
    </div>
  );
}
