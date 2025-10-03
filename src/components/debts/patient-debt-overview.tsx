"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertTriangle, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DebtSummary {
  totalPatientsWithDebts: number;
  totalDebtAmount: number;
  patients: {
    patientId: string;
    patientName: string;
    totalDebt: number;
    unpaidRecords: number;
  }[];
}

export function PatientDebtOverview() {
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDebtSummary();
  }, []);

  const fetchDebtSummary = async () => {
    try {
      const response = await fetch("/api/debts");
      if (response.ok) {
        const data = await response.json();
        console.log("Debt summary data:", data);
        setDebtSummary(data);
      } else {
        console.error("Failed to fetch debt summary:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch debt summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-gray-500">در حال بارگذاری نمای کلی بدهی‌ها...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!debtSummary || debtSummary.patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-gray-500 font-medium">همه چیز مرتب است!</p>
            <p className="text-sm text-gray-400 mt-1">بدهی معوقی وجود ندارد</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">بیماران با بدهی</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{debtSummary.totalPatientsWithDebts.toLocaleString('fa-IR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">کل بدهی معوق</p>
                <p className="text-lg sm:text-xl font-bold text-red-600">
                  {formatCurrency(debtSummary.totalDebtAmount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">میانگین بدهی</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatCurrency(
                    debtSummary.totalPatientsWithDebts > 0 
                      ? (debtSummary.totalDebtAmount || 0) / debtSummary.totalPatientsWithDebts 
                      : 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Debtors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>بالاترین بدهی‌های معوق</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {debtSummary.patients.slice(0, 5).map((patient) => (
              <div key={patient.patientId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-red-600">
                      {patient.patientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{patient.patientName}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {patient.unpaidRecords.toLocaleString('fa-IR')} پرونده پرداخت نشده
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-red-600 text-sm sm:text-base">{formatCurrency(patient.totalDebt || 0)}</p>
                </div>
              </div>
            ))}
            
            {debtSummary.patients.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-gray-500">
                  و {(debtSummary.patients.length - 5).toLocaleString('fa-IR')} بیمار دیگر با بدهی معوق
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
