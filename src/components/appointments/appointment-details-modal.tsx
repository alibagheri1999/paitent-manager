"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PositionedModal } from "@/components/ui/positioned-modal";
import { Calendar, Clock, User, Phone, Hash, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatDate, formatTime } from "@/lib/utils";
import { translateAppointmentStatus, translateTreatmentType } from "@/lib/translate-enums";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  appointment: any;
  triggerElement?: HTMLElement | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function AppointmentDetailsModal({ isOpen, appointment, triggerElement, onClose, onRefresh }: AppointmentDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === "CANCELLED" && !cancellationReason.trim()) {
      toast.error("لطفاً دلیل لغو را وارد کنید");
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
        toast.success(`نوبت با موفقیت ${translateAppointmentStatus(newStatus)} شد`);
        if (newStatus === "CANCELLED") {
          toast.info("پیامک اطلاع‌رسانی برای بیمار ارسال شد");
        }
        onRefresh();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در به‌روزرسانی نوبت");
      }
    } catch (error) {
      toast.error("خطا در به‌روزرسانی نوبت");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این نوبت را حذف کنید؟ پیامک اطلاع‌رسانی برای بیمار ارسال خواهد شد.")) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("نوبت با موفقیت حذف شد");
        toast.info("پیامک اطلاع‌رسانی برای بیمار ارسال شد");
        onRefresh();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در حذف نوبت");
      }
    } catch (error) {
      toast.error("خطا در حذف نوبت");
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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.SCHEDULED}`}>
        {translateAppointmentStatus(status)}
      </span>
    );
  };

  return (
    <PositionedModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      title={
        <div className="flex items-center gap-2">
          <span>جزئیات نوبت</span>
          <Calendar className="h-5 w-5" />
        </div>
      }
      maxWidth="850px"
    >
      <div className="space-y-6 p-6">
          {/* Patient Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center justify-end gap-2 text-right">
              <span>اطلاعات بیمار</span>
              <User className="h-5 w-5 text-blue-600" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-right">
                <label className="text-sm font-medium text-gray-600 block">نام بیمار</label>
                <p className="text-gray-900 font-semibold">{appointment.patientName}</p>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-gray-600 block">وضعیت</label>
                <div className="mt-1">{getStatusBadge(appointment.status)}</div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center justify-end gap-2 text-right">
              <span>جزئیات نوبت</span>
              <Clock className="h-5 w-5 text-green-600" />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-right">
                <label className="text-sm font-medium text-gray-600 block">تاریخ</label>
                <p className="text-gray-900 font-semibold">
                  {formatDate(new Date(appointment.start))}
                </p>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-gray-600 block">زمان</label>
                <p className="text-gray-900 font-semibold" dir="ltr">
                  {formatTime(new Date(appointment.start))} - {formatTime(new Date(appointment.end))}
                </p>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-gray-600 block">نوع درمان</label>
                <p className="text-gray-900 font-semibold">{appointment.treatmentType ? translateTreatmentType(appointment.treatmentType) : "تعیین نشده"}</p>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-gray-600 block">توضیحات</label>
                <p className="text-gray-900 font-semibold">{appointment.description || "بدون توضیحات"}</p>
              </div>
            </div>
            {appointment.notes && (
              <div className="mt-4 text-right">
                <label className="text-sm font-medium text-gray-600 flex items-center justify-end gap-2">
                  <span>یادداشت‌ها</span>
                  <MessageSquare className="h-4 w-4" />
                </label>
                <p className="text-gray-900 mt-1 bg-white/50 p-2 rounded">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Cancellation Form */}
          {showCancelForm && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-lg mb-3 text-red-800 text-right">لغو نوبت</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    دلیل لغو *
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
                    rows={3}
                    placeholder="لطفاً دلیل لغو نوبت را وارد کنید..."
                  />
                </div>
                <div className="flex gap-2 justify-start">
                  <Button
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? "در حال لغو..." : "تایید لغو"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelForm(false)}
                    disabled={isLoading}
                  >
                    انصراف
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t justify-start">
            {appointment.status === "SCHEDULED" && (
              <Button
                onClick={() => handleStatusUpdate("CONFIRMED")}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                تایید
              </Button>
            )}
            
            {appointment.status === "CONFIRMED" && (
              <Button
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                disabled={isLoading}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                شروع
              </Button>
            )}
            
            {appointment.status === "IN_PROGRESS" && (
              <Button
                onClick={() => handleStatusUpdate("COMPLETED")}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                تکمیل
              </Button>
            )}

            {!["CANCELLED", "COMPLETED"].includes(appointment.status) && (
              <Button
                onClick={() => setShowCancelForm(true)}
                disabled={isLoading}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                لغو نوبت
              </Button>
            )}

            <Button
              onClick={handleDelete}
              disabled={isLoading}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              حذف نوبت
            </Button>
          </div>
      </div>
    </PositionedModal>
  );
}
