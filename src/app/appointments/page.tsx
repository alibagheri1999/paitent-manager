"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentDetailsModal } from "@/components/appointments/appointment-details-modal";
import { ExportButton } from "@/components/ui/export-button";
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-in-right">Appointments</h1>
            <p className="text-sm sm:text-base text-gray-600 animate-slide-in-right animation-delay-500">Manage your dental clinic appointments</p>
          </div>
          <div className="animate-slide-in-left animation-delay-500">
            <ExportButton
              exportType="appointments"
              filename="appointments_export"
              variant="outline"
              className="w-full sm:w-auto hover-lift hover:animate-wiggle"
            >
              Export Appointments
            </ExportButton>
          </div>
        </div>
        
        <div className="animate-bounce-in animation-delay-1000">
          <AppointmentCalendar 
            onDateSelect={handleDateSelect}
            onEditAppointment={handleEditAppointment}
            refreshKey={refreshKey}
          />
        </div>

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
