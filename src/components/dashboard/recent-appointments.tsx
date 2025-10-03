"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { translateAppointmentStatus, translateTreatmentType } from "@/lib/translate-enums";

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

interface TodayAppointmentsProps {
  onCancel?: (appointment: Appointment, element?: HTMLElement) => void;
  onReschedule?: (appointment: Appointment, element?: HTMLElement) => void;
  refreshKey?: number;
}

export function TodayAppointments({ onCancel, onReschedule, refreshKey }: TodayAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        const response = await fetch(`/api/appointments?date=${today}&view=day&limit=10`);
        if (response.ok) {
          const data = await response.json();
          let appointments = data.appointments || [];
          
          console.log("Dashboard - Today's appointments from API:", appointments);
          
          // Show all today's appointments (don't filter by time)
          appointments = appointments.filter((appointment: any) => {
            return appointment.status !== 'CANCELLED' && appointment.status !== 'NO_SHOW';
          });
          
          // Sort by start time and take only the first 5
          appointments = appointments
            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
            .slice(0, 5);
          
          console.log("Dashboard - Filtered appointments to display:", appointments);
          setAppointments(appointments);
        }
      } catch (error) {
        console.error("Failed to fetch today's appointments:", error);
        setAppointments([]); // Set empty array on error
      }
    };

    fetchTodayAppointments();
  }, [refreshKey]);


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
          <CardTitle>نوبت‌های امروز</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">نوبت آینده‌ای برای امروز وجود ندارد</p>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                        {appointment.treatmentType && (
                          <p className="text-xs text-gray-400">
                            {translateTreatmentType(appointment.treatmentType)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {translateAppointmentStatus('SCHEDULED')}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => onReschedule?.(appointment, e.currentTarget)}
                        className="h-8 w-8 p-0"
                        title="تغییر زمان"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => onCancel?.(appointment, e.currentTarget)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="لغو"
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
    </>
  );
}
