"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your clinic settings and preferences</p>
        </div>

        <SettingsForm />
      </div>
    </DashboardLayout>
  );
}
