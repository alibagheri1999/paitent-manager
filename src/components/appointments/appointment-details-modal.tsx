"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Calendar, Clock, User, Phone, Hash, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AppointmentDetailsModalProps {
  appointment: any;
  onClose: () => void;
  onRefresh: () => void;
}

export function AppointmentDetailsModal({ appointment, onClose, onRefresh }: AppointmentDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === "CANCELLED" && !cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          cancellationReason: newStatus === "CANCELLED" ? cancellationReason : undefined,
        }),
      });

      if (response.ok) {
        toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
        if (newStatus === "CANCELLED") {
          toast.info("SMS notification sent to patient");
        }
        onRefresh();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update appointment");
      }
    } catch (error) {
      toast.error("An error occurred while updating the appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this appointment? This will send an SMS notification to the patient.")) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Appointment deleted successfully");
        toast.info("SMS notification sent to patient");
        onRefresh();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete appointment");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-green-100 text-green-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-purple-100 text-purple-800",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.SCHEDULED}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Patient Name</label>
                <p className="text-gray-900">{appointment.patientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(appointment.status)}</div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="text-gray-900">
                  {format(new Date(appointment.start), "EEEE, MMMM do, yyyy")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Time</label>
                <p className="text-gray-900">
                  {format(new Date(appointment.start), "h:mm a")} - {format(new Date(appointment.end), "h:mm a")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Treatment Type</label>
                <p className="text-gray-900">{appointment.treatmentType || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{appointment.description || "No description"}</p>
              </div>
            </div>
            {appointment.notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes
                </label>
                <p className="text-gray-900 mt-1">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Cancellation Form */}
          {showCancelForm && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-lg mb-3 text-red-800">Cancel Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation *
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Please provide a reason for cancelling this appointment..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? "Cancelling..." : "Confirm Cancellation"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelForm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {appointment.status === "SCHEDULED" && (
              <Button
                onClick={() => handleStatusUpdate("CONFIRMED")}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm
              </Button>
            )}
            
            {appointment.status === "CONFIRMED" && (
              <Button
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Start
              </Button>
            )}
            
            {appointment.status === "IN_PROGRESS" && (
              <Button
                onClick={() => handleStatusUpdate("COMPLETED")}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Complete
              </Button>
            )}

            {!["CANCELLED", "COMPLETED"].includes(appointment.status) && (
              <Button
                onClick={() => setShowCancelForm(true)}
                disabled={isLoading}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Cancel Appointment
              </Button>
            )}

            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Delete Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
