"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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

interface CancelModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelModal({ appointment, onClose, onSuccess }: CancelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: appointment.patientId,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          treatmentType: appointment.treatmentType,
          status: "CANCELLED",
          cancellationReason: reason,
        }),
      });

      if (response.ok) {
        toast.success("Appointment cancelled successfully and SMS sent to patient");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("An error occurred while cancelling the appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Cancel Appointment</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-medium text-red-900">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </p>
            <p className="text-sm text-red-700">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
            </p>
            {appointment.treatmentType && (
              <p className="text-xs text-red-600 capitalize">
                {appointment.treatmentType.toLowerCase().replace("_", " ")}
              </p>
            )}
          </div>

          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action will cancel the appointment and send an SMS notification to the patient.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Cancellation *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Please provide a reason for cancelling this appointment..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Keep Appointment
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !reason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
