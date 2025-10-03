"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { translateTreatmentType } from "@/lib/translate-enums";
import { BarChart as BarChartIcon, DollarSign } from "lucide-react";

interface Treatment {
  treatmentType: string;
  count: number;
  revenue: number;
}

interface TreatmentStatsProps {
  treatments: Treatment[];
}

export function TreatmentStats({ treatments }: TreatmentStatsProps) {
  const chartData = treatments.map(treatment => ({
    name: translateTreatmentType(treatment.treatmentType),
    count: treatment.count,
    revenue: treatment.revenue,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Treatment Count Chart */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="text-right text-lg font-bold flex items-center justify-end gap-2">
            <span>انواع درمان (تعداد)</span>
            <BarChart className="h-5 w-5 text-blue-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => value.toLocaleString('fa-IR')}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  width={150}
                  style={{ fontSize: '12px', textAlign: 'right' }}
                />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString('fa-IR'), "تعداد"]}
                  labelStyle={{ textAlign: 'right' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Revenue Chart */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className="text-right text-lg font-bold flex items-center justify-end gap-2">
            <span>انواع درمان (درآمد)</span>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  tickFormatter={(value) => value.toLocaleString('fa-IR')}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  width={150}
                  style={{ fontSize: '12px', textAlign: 'right' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "درآمد"]}
                  labelStyle={{ textAlign: 'right' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
