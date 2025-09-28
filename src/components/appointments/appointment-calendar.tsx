"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    patientName: string;
    treatmentType?: string;
    status: string;
    patientId: string;
    phone?: string;
    email?: string;
  };
}

interface CalendarData {
  view: string;
  calendarTitle: string;
  appointments: any[];
  appointmentsByDate: any;
  calendarGrid: any[];
  timeSlots: any;
  stats: any;
  navigation: any;
}

interface AppointmentCalendarProps {
  onDateSelect: (date: string) => void;
  onEditAppointment: (appointment: any) => void;
  refreshKey?: number;
}

export function AppointmentCalendar({ onDateSelect, onEditAppointment, refreshKey }: AppointmentCalendarProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [currentView, setCurrentView] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        console.log("Fetching calendar data for view:", currentView, "date:", currentDate);
        
        const response = await fetch(`/api/calendar?view=${currentView}&date=${currentDate}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Calendar data:", data);
          
          // Format appointments for FullCalendar
          const formattedAppointments = data.appointments.map((apt: any) => {
            // Fix invalid end time (if end time is before start time, add 30 minutes to start time)
            let endTime = apt.endTime;
            if (apt.endTime && apt.startTime && apt.endTime <= apt.startTime) {
              const [startHour, startMin] = apt.startTime.split(':').map(Number);
              const endMin = startMin + 30;
              const endHour = endMin >= 60 ? startHour + 1 : startHour;
              const finalEndMin = endMin >= 60 ? endMin - 60 : endMin;
              endTime = `${endHour.toString().padStart(2, '0')}:${finalEndMin.toString().padStart(2, '0')}`;
            }
            
            // Format date properly (remove timezone info)
            const dateStr = apt.date.split('T')[0];
            
            return {
              id: apt.id,
              title: `${apt.patient.firstName} ${apt.patient.lastName}`,
              start: `${dateStr}T${apt.startTime}:00`,
              end: `${dateStr}T${endTime}:00`,
              backgroundColor: getStatusColor(apt.status),
              borderColor: getStatusColor(apt.status),
              extendedProps: {
                patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
                treatmentType: apt.treatmentType,
                status: apt.status,
                description: apt.description,
                notes: apt.notes,
                patientId: apt.patient.id,
                phone: apt.patient.phone,
                email: apt.patient.email,
              },
            };
          });
          
          console.log("Formatted appointments for FullCalendar:", formattedAppointments);
          setAppointments(formattedAppointments);
          setCalendarData(data);
        } else {
          console.error("Failed to fetch calendar data, status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      }
    };

    fetchCalendarData();
  }, [currentView, currentDate, refreshKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "#3b82f6";
      case "CONFIRMED":
        return "#10b981";
      case "IN_PROGRESS":
        return "#f59e0b";
      case "COMPLETED":
        return "#6b7280";
      case "CANCELLED":
        return "#ef4444";
      case "NO_SHOW":
        return "#8b5cf6";
      default:
        return "#3b82f6";
    }
  };

  const handleDateClick = (info: any) => {
    const dateStr = info.dateStr;
    onDateSelect(dateStr);
  };

  const handleEventClick = (info: any) => {
    const appointment = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps,
    };
    onEditAppointment(appointment);
  };

  const handleViewChange = (view: "month" | "week" | "day") => {
    setCurrentView(view);
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const handleNavigation = (direction: "prev" | "next" | "today") => {
    const currentDateObj = new Date(currentDate);
    let newDate: Date;
    
    if (direction === "today") {
      newDate = new Date();
    } else {
      // Calculate navigation based on current view
      switch (currentView) {
        case "day":
          newDate = new Date(currentDateObj);
          newDate.setDate(currentDateObj.getDate() + (direction === "next" ? 1 : -1));
          break;
        case "week":
          newDate = new Date(currentDateObj);
          newDate.setDate(currentDateObj.getDate() + (direction === "next" ? 7 : -7));
          break;
        case "month":
        default:
          newDate = new Date(currentDateObj);
          newDate.setMonth(currentDateObj.getMonth() + (direction === "next" ? 1 : -1));
          break;
      }
    }
    
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  const getCalendarView = () => {
    switch (currentView) {
      case "day":
        return "timeGridDay";
      case "week":
        return "timeGridWeek";
      case "month":
      default:
        return "dayGridMonth";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Calendar Header with Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {calendarData?.calendarTitle || "Calendar"}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewChange("month")}
                  className={currentView === "month" ? "bg-blue-50 border-blue-200" : ""}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewChange("week")}
                  className={currentView === "week" ? "bg-blue-50 border-blue-200" : ""}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewChange("day")}
                  className={currentView === "day" ? "bg-blue-50 border-blue-200" : ""}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Day
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("today")}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          {calendarData?.stats && (
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {calendarData.stats.totalAppointments}
                </div>
                <div className="text-sm text-blue-800">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {calendarData.stats.scheduled}
                </div>
                <div className="text-sm text-green-800">Scheduled</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {calendarData.stats.completed}
                </div>
                <div className="text-sm text-emerald-800">Completed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {calendarData.stats.cancelled}
                </div>
                <div className="text-sm text-red-800">Cancelled</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {calendarData.stats.noShow}
                </div>
                <div className="text-sm text-yellow-800">No Show</div>
              </div>
            </div>
          )}
        </div>

        {/* FullCalendar */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={getCalendarView()}
          headerToolbar={false} // We're using custom header
          events={appointments}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6], // Monday - Saturday
            startTime: "09:00",
            endTime: "18:00",
          }}
          eventDisplay="block"
          dayMaxEvents={currentView === "month" ? 3 : false}
          moreLinkClick="popover"
          initialDate={currentDate}
          validRange={{
            start: calendarData?.dateRange.start,
            end: calendarData?.dateRange.end,
          }}
          selectable={true}
          selectMirror={true}
          weekends={true}
          allDaySlot={false}
          eventTextColor="#ffffff"
        />
      </CardContent>
    </Card>
  );
}
