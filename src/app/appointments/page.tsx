"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentDetailsModal } from "@/components/appointments/appointment-details-modal";
import { useState } from "react";

export default function AppointmentsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [viewingAppointment, setViewingAppointment] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setIsFormOpen(true);
  };

  const handleEditAppointment = (appointment: any) => {
    setViewingAppointment(appointment);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAppointment(null);
    setSelectedDate("");
  };

  const handleDetailsClose = () => {
    setViewingAppointment(null);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your dental clinic appointments</p>
        </div>

        <AppointmentCalendar 
          onDateSelect={handleDateSelect}
          onEditAppointment={handleEditAppointment}
          refreshKey={refreshKey}
        />

        {isFormOpen && (
          <AppointmentForm
            selectedDate={selectedDate}
            appointment={editingAppointment}
            onClose={handleFormClose}
            onSuccess={handleRefresh}
          />
        )}

        {viewingAppointment && (
          <AppointmentDetailsModal
            appointment={viewingAppointment}
            onClose={handleDetailsClose}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
