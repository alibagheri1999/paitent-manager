"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, Activity } from "lucide-react";

interface StatsData {
  totalPatients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  activePatients: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    activePatients: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "کل بیماران",
      value: stats.totalPatients.toLocaleString('fa-IR'),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "نوبت‌های امروز",
      value: stats.todayAppointments.toLocaleString('fa-IR'),
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "درآمد ماهانه",
      value: `${stats.monthlyRevenue.toLocaleString('fa-IR')} ریال`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "بیماران فعال",
      value: stats.activePatients.toLocaleString('fa-IR'),
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index} 
            className="card-hover animate-bounce-in hover-lift group"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors duration-300 group-hover:font-semibold">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:animate-glow`}>
                <Icon className={`h-4 w-4 ${stat.color} group-hover:animate-pulse group-hover:rotate-12`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 group-hover:scale-105">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
