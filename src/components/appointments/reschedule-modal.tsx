"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInputWithJalali } from "@/components/ui/date-input-with-jalali";
import { PositionedModal } from "@/components/ui/positioned-modal";
import { Calendar, Clock } from "lucide-react";
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

interface RescheduleModalProps {
  isOpen: boolean;
  appointment: Appointment;
  triggerElement?: HTMLElement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RescheduleModal({ isOpen, appointment, triggerElement, onClose, onSuccess }: RescheduleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDate, setNewDate] = useState(appointment.date);
  const [newStartTime, setNewStartTime] = useState(appointment.startTime);
  const [newEndTime, setNewEndTime] = useState(appointment.endTime);
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
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          treatmentType: appointment.treatmentType,
          status: appointment.status,
          rescheduleReason: reason,
        }),
      });

      if (response.ok) {
        toast.success("نوبت با موفقیت تغییر زمان داده شد و پیامک برای بیمار ارسال شد");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || "خطا در تغییر زمان نوبت");
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("خطا در تغییر زمان نوبت");
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
        <div className="flex items-center gap-2 flex-row-reverse">
          <span>تغییر زمان نوبت</span>
          <Calendar className="h-5 w-5" />
        </div>
      }
      maxWidth="8000px"
    >
      <div className="p-6">
            <div className="w-[550px] mx-auto mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-lg">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  زمان فعلی: {formatDate(new Date(appointment.date))} در ساعت {appointment.startTime}
                </p>
                {appointment.treatmentType && (
                  <p className="text-xs text-gray-500 mt-1">
                    {translateTreatmentType(appointment.treatmentType)}
                  </p>
                )}
              </div>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 flex-row-reverse justify-end">
                  <span>تاریخ جدید *</span>
                  <Calendar className="h-4 w-4" />
                </label>
                <DateInputWithJalali
                  value={newDate}
                  onChange={setNewDate}
                  required
                  className="text-center"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="order-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 flex-row-reverse justify-end">
                    <span>زمان پایان *</span>
                    <Clock className="h-4 w-4" />
                  </label>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="text-center"
                    required
                  />
                </div>
                
                <div className="order-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 flex-row-reverse justify-end">
                    <span>زمان شروع *</span>
                    <Clock className="h-4 w-4" />
                  </label>
                  <Input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  دلیل تغییر زمان
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  rows={3}
                  placeholder="دلیل تغییر زمان (اختیاری)..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  لغو
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {isSubmitting ? "در حال تغییر زمان..." : "تغییر زمان نوبت"}
                </Button>
              </div>
            </form>
      </div>
    </PositionedModal>
  );
}
