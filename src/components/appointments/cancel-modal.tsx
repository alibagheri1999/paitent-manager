"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PositionedModal } from "@/components/ui/positioned-modal";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { translateTreatmentType } from "@/lib/translate-enums";

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
  isOpen: boolean;
  appointment: Appointment;
  triggerElement?: HTMLElement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelModal({ isOpen, appointment, triggerElement, onClose, onSuccess }: CancelModalProps) {
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
        toast.success("نوبت با موفقیت لغو شد و پیامک برای بیمار ارسال شد");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "خطا در لغو نوبت");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("خطا در لغو نوبت");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PositionedModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      title={
        <div className="flex items-center justify-end gap-2 text-white">
          <span>لغو نوبت</span>
          <AlertTriangle className="h-5 w-5" />
        </div>
      }
      maxWidth="650px"
    >
      <div className="p-6">
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-right">
            <p className="font-semibold text-red-900 text-lg">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </p>
            <p className="text-sm text-red-700 mt-1">
              {formatDate(new Date(appointment.date))} در ساعت {appointment.startTime}
            </p>
            {appointment.treatmentType && (
              <p className="text-xs text-red-600 mt-1">
                {translateTreatmentType(appointment.treatmentType)}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-right">
            <strong>هشدار:</strong> این عملیات نوبت را لغو کرده و پیامک اطلاع‌رسانی برای بیمار ارسال می‌کند.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              دلیل لغو *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
              rows={3}
              placeholder="لطفاً دلیل لغو نوبت را وارد کنید..."
              required
            />
          </div>

          <div className="flex justify-start gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={isSubmitting || !reason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "در حال لغو..." : "لغو نوبت"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              نگه داشتن نوبت
            </Button>
          </div>
        </form>
      </div>
    </PositionedModal>
  );
}
