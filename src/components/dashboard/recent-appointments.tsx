"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { CancelModal } from "@/components/appointments/cancel-modal";
import { RescheduleModal } from "@/components/appointments/reschedule-modal";

interface Appointment {
  id: string;
  patientId: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  treatmentType?: string;
}

export function TodayAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0]; // Get current time in HH:MM:SS format
        
        const response = await fetch(`/api/appointments?date=${today}&view=day&limit=10`);
        if (response.ok) {
          const data = await response.json();
          let appointments = data.appointments || [];
          
          // Filter for today's appointments that are scheduled and haven't started yet
          appointments = appointments.filter((appointment: any) => {
            return appointment.status === 'SCHEDULED' && 
                   appointment.startTime >= currentTime;
          });
          
          // Sort by start time and take only the first 5
          appointments = appointments
            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
            .slice(0, 5);
          
          setAppointments(appointments);
        }
      } catch (error) {
        console.error("Failed to fetch today's appointments:", error);
        setAppointments([]); // Set empty array on error
      }
    };

    fetchTodayAppointments();
  }, []);

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleModalClose = () => {
    setShowCancelModal(false);
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    // Refresh the appointments list
    const fetchTodayAppointments = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0];
        
        const response = await fetch(`/api/appointments?date=${today}&view=day&limit=10`);
        if (response.ok) {
          const data = await response.json();
          let appointments = data.appointments || [];
          
          appointments = appointments.filter((appointment: any) => {
            return appointment.status === 'SCHEDULED' && 
                   appointment.startTime >= currentTime;
          });
          
          appointments = appointments
            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
            .slice(0, 5);
          
          setAppointments(appointments);
        }
      } catch (error) {
        console.error("Failed to fetch today's appointments:", error);
      }
    };
    fetchTodayAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming appointments today</p>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                        {appointment.treatmentType && (
                          <p className="text-xs text-gray-400 capitalize">
                            {appointment.treatmentType.toLowerCase().replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      Scheduled
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReschedule(appointment)}
                        className="h-8 w-8 p-0"
                        title="Reschedule"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(appointment)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCancelModal && selectedAppointment && (
        <CancelModal
          appointment={selectedAppointment}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}

      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
