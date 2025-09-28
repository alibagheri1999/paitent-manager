"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientSearch } from "@/components/ui/patient-search";
import { X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  treatmentType: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  email: string;
}

interface AppointmentFormProps {
  selectedDate?: string;
  appointment?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentForm({ selectedDate, appointment, onClose, onSuccess }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      patientId: appointment.patientId || "",
      date: appointment.start ? format(new Date(appointment.start), "yyyy-MM-dd") : "",
      startTime: appointment.start ? format(new Date(appointment.start), "HH:mm") : "",
      endTime: appointment.end ? format(new Date(appointment.end), "HH:mm") : "",
      treatmentType: appointment.treatmentType || "",
      description: appointment.description || "",
      notes: appointment.notes || "",
    } : {
      date: selectedDate || "",
    },
  });

  useEffect(() => {
    if (selectedDate) {
      setValue("date", selectedDate);
    }
  }, [selectedDate, setValue]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        ...data,
        patientId: selectedPatient.id,
      };

      console.log("Submitting appointment data:", appointmentData);

      const url = appointment ? `/api/appointments/${appointment.id}` : "/api/appointments";
      const method = appointment ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Appointment saved:", result);
        toast.success(appointment ? "Appointment updated successfully" : "Appointment created successfully");
        onClose();
        // Call onSuccess callback to refresh the calendar
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const error = await response.json();
        console.error("Error response:", error);
        toast.error(error.message || "Failed to save appointment");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred while saving the appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{appointment ? "Edit Appointment" : "Schedule New Appointment"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <PatientSearch
                onPatientSelect={setSelectedPatient}
                selectedPatient={selectedPatient}
                placeholder="Search by name, phone, or national ID..."
              />
              {!selectedPatient && (
                <p className="text-red-500 text-sm mt-1">Please select a patient</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  {...register("date")}
                  type="date"
                  required
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <Input
                  {...register("startTime")}
                  type="time"
                  required
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <Input
                  {...register("endTime")}
                  type="time"
                  required
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Type
              </label>
              <select
                {...register("treatmentType")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select treatment type</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="CLEANING">Cleaning</option>
                <option value="FILLING">Filling</option>
                <option value="EXTRACTION">Extraction</option>
                <option value="CROWN">Crown</option>
                <option value="BRIDGE">Bridge</option>
                <option value="IMPLANT">Implant</option>
                <option value="ROOT_CANAL">Root Canal</option>
                <option value="ORTHODONTICS">Orthodontics</option>
                <option value="COSMETIC">Cosmetic</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter appointment description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register("notes")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : appointment ? "Update Appointment" : "Schedule Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
