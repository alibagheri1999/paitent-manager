"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DebtReport } from "@/components/debts/debt-report";

export default function DebtsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debt Management</h1>
          <p className="text-gray-600">Track and manage patient outstanding debts</p>
        </div>
        
        <DebtReport />
      </div>
    </DashboardLayout>
  );
}
