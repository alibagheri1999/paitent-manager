"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
        <CardTitle>Patient Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [value, "Patients"]}
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
