"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, X } from "lucide-react";
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

interface TomorrowAppointmentsProps {
  onCancel?: (appointment: Appointment, element?: HTMLElement) => void;
  onReschedule?: (appointment: Appointment, element?: HTMLElement) => void;
  refreshKey?: number;
}

export function TomorrowAppointments({ onCancel, onReschedule, refreshKey }: TomorrowAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchTomorrowAppointments = async () => {
      try {
        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];
        
        const response = await fetch(`/api/appointments?date=${tomorrowDate}&view=day&limit=10`);
        if (response.ok) {
          const data = await response.json();
          let appointments = data.appointments || [];
          
          // Filter for tomorrow's scheduled appointments
          appointments = appointments.filter((appointment: any) => {
            return appointment.status === 'SCHEDULED';
          });
          
          // Sort by start time and take only the first 5
          appointments = appointments
            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
            .slice(0, 5);
          
          setAppointments(appointments);
        }
      } catch (error) {
        console.error("Failed to fetch tomorrow's appointments:", error);
        setAppointments([]); // Set empty array on error
      }
    };

    fetchTomorrowAppointments();
  }, [refreshKey]);


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>نوبت‌های فردا</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">نوبتی برای فردا برنامه‌ریزی نشده است</p>
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
