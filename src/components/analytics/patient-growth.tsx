"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toJalali } from "@/lib/utils";

interface PatientGrowthData {
  date: string;
  count: number;
}

export function PatientGrowth() {
  const [data, setData] = useState<PatientGrowthData[]>([]);

  useEffect(() => {
    const fetchPatientGrowth = async () => {
      try {
        const response = await fetch("/api/analytics/patient-growth");
        if (response.ok) {
          const growthData = await response.json();
          setData(growthData);
        }
      } catch (error) {
        console.error("Failed to fetch patient growth data:", error);
        setData([]);
      }
    };

    fetchPatientGrowth();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">رشد بیماران</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => toJalali(value, 'jMM/jDD')}
              />
              <YAxis 
                tickFormatter={(value) => value.toLocaleString('fa-IR')}
                orientation="right"
              />
              <Tooltip 
                labelFormatter={(value) => toJalali(value, 'jD jMMMM jYYYY')}
                formatter={(value: number) => [value.toLocaleString('fa-IR'), "بیماران"]}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
