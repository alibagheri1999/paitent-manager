"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DebtReport } from "@/components/debts/debt-report";

export default function DebtsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">مدیریت بدهی‌ها</h1>
          <p className="text-sm sm:text-base text-gray-600">پیگیری و مدیریت بدهی‌های معوق بیماران</p>
        </div>
        
        <DebtReport />
      </div>
    </DashboardLayout>
  );
}
