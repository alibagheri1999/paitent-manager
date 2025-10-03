"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toJalali } from "@/lib/date-utils";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
  date: string;
  revenue: number;
}

export function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await fetch("/api/analytics/revenue");
        if (response.ok) {
          const revenueData = await response.json();
          setData(revenueData);
        }
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
        setData([]);
      }
    };

    fetchRevenueData();
  }, []);

  const formatJalaliDate = (dateStr: string) => {
    try {
      return toJalali(new Date(dateStr), 'jMM/jDD');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>نمای کلی درآمد</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatJalaliDate}
              />
              <YAxis 
                tickFormatter={(value) => value.toLocaleString('fa-IR')}
                orientation="right"
              />
              <Tooltip 
                labelFormatter={(value) => toJalali(new Date(value), 'jD jMMMM jYYYY')}
                formatter={(value: number) => [formatCurrency(value), "درآمد"]}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
