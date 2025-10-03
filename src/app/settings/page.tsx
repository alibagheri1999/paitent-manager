"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تنظیمات</h1>
          <p className="text-gray-600">مدیریت تنظیمات و ترجیحات کلینیک</p>
        </div>

        <SettingsForm />
      </div>
    </DashboardLayout>
  );
}
