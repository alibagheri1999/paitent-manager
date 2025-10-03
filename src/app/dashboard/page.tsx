"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { TodayAppointments } from "@/components/dashboard/recent-appointments";
import { TomorrowAppointments } from "@/components/dashboard/upcoming-appointments";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RescheduleModal } from "@/components/appointments/reschedule-modal";
import { CancelModal } from "@/components/appointments/cancel-modal";

export default function Dashboard() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCancel = (appointment: any, element?: HTMLElement) => {
    setSelectedAppointment(appointment);
    setTriggerElement(element || null);
    setShowCancelModal(true);
  };

  const handleReschedule = (appointment: any, element?: HTMLElement) => {
    setSelectedAppointment(appointment);
    setTriggerElement(element || null);
    setShowRescheduleModal(true);
  };

  const handleModalClose = () => {
    setShowCancelModal(false);
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    setTriggerElement(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-bounce-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-in-right">داشبورد</h1>
          <p className="text-sm sm:text-base text-gray-600 animate-slide-in-right animation-delay-500">خوش آمدید به سیستم مدیریت کلینیک دندانپزشکی</p>
        </div>
        
        <div className="animate-bounce-in animation-delay-500">
          <StatsCards />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 animate-fade-in animation-delay-1000">
          <div className="animate-slide-in-from-left animation-delay-1200">
            <TodayAppointments 
              onCancel={handleCancel}
              onReschedule={handleReschedule}
              refreshKey={refreshKey}
            />
          </div>
          <div className="animate-slide-in-from-right animation-delay-1400">
            <TomorrowAppointments 
              onCancel={handleCancel}
              onReschedule={handleReschedule}
              refreshKey={refreshKey}
            />
          </div>
        </div>
        
        <div className="animate-bounce-in animation-delay-1600">
          <RevenueChart />
        </div>
      </div>

      {/* Modals at dashboard root level */}
      {showCancelModal && selectedAppointment && (
        <CancelModal
          isOpen={showCancelModal}
          appointment={selectedAppointment}
          triggerElement={triggerElement}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}

      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          isOpen={showRescheduleModal}
          appointment={selectedAppointment}
          triggerElement={triggerElement}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </DashboardLayout>
  );
}
