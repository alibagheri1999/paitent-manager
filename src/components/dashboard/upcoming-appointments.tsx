"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface Appointment {
  id: string;
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

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/appointments?date=${today}&status=SCHEDULED&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error("Failed to fetch upcoming appointments:", error);
      }
    };

    fetchUpcomingAppointments();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Upcoming Appointments</CardTitle>
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
                <Badge className="bg-blue-100 text-blue-800">
                  Scheduled
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
