"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientSearch } from "@/components/ui/patient-search";
import { DateInputWithJalali } from "@/components/ui/date-input-with-jalali";
import { PositionedModal } from "@/components/ui/positioned-modal";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const appointmentSchema = z.object({
  patientId: z.string().optional(), // Make patientId optional since we handle it separately
  date: z.string().min(1, "تاریخ الزامی است"),
  startTime: z.string().min(1, "زمان شروع الزامی است"),
  endTime: z.string().min(1, "زمان پایان الزامی است"),
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
  isOpen: boolean;
  selectedDate?: string;
  appointment?: any;
  triggerElement?: HTMLElement | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentForm({ isOpen, selectedDate, appointment, triggerElement, onClose, onSuccess }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
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
    // Validate patient selection first
    if (!selectedPatient) {
      toast.error("لطفاً یک بیمار انتخاب کنید");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const appointmentData = {
        ...data,
        patientId: selectedPatient.id,
      };

      const url = appointment ? `/api/appointments/${appointment.id}` : "/api/appointments";
      const method = appointment ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(appointment ? "نوبت با موفقیت به‌روزرسانی شد" : "نوبت با موفقیت ایجاد شد");
        onClose();
        // Call onSuccess callback to refresh the calendar
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در ذخیره نوبت");
      }
    } catch (error) {
      toast.error("خطا در ذخیره نوبت");
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
        <div className="flex items-center gap-2">
          <span>{appointment ? "ویرایش نوبت" : "ایجاد نوبت جدید"}</span>
          <Calendar className="h-5 w-5" />
        </div>
      }
      maxWidth="850px"
    >
      <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                بیمار *
              </label>
              <PatientSearch
                onPatientSelect={setSelectedPatient}
                selectedPatient={selectedPatient}
                placeholder="جستجو بر اساس نام، تلفن یا کد ملی..."
              />
              {!selectedPatient && (
                <p className="text-red-500 text-sm mt-1 text-right">لطفاً یک بیمار انتخاب کنید</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right flex items-center justify-end gap-2">
                  <span>تاریخ *</span>
                  <Calendar className="h-4 w-4" />
                </label>
                <DateInputWithJalali
                  value={watch("date") || ""}
                  onChange={(date) => setValue("date", date)}
                  required
                  className="text-center"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.date.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right flex items-center justify-end gap-2">
                  <span>زمان شروع *</span>
                  <Clock className="h-4 w-4" />
                </label>
                <Input
                  {...register("startTime")}
                  type="time"
                  required
                  className="text-center"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.startTime.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right flex items-center justify-end gap-2">
                  <span>زمان پایان *</span>
                  <Clock className="h-4 w-4" />
                </label>
                <Input
                  {...register("endTime")}
                  type="time"
                  required
                  className="text-center"
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                نوع درمان
              </label>
              <select
                {...register("treatmentType")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
              >
                <option value="">انتخاب نوع درمان</option>
                <option value="CONSULTATION">مشاوره</option>
                <option value="CLEANING">جرمگیری</option>
                <option value="FILLING">ترمیم</option>
                <option value="EXTRACTION">کشیدن دندان</option>
                <option value="CROWN">روکش</option>
                <option value="BRIDGE">بریج</option>
                <option value="IMPLANT">ایمپلنت</option>
                <option value="ROOT_CANAL">عصب‌کشی</option>
                <option value="ORTHODONTICS">ارتودنسی</option>
                <option value="COSMETIC">زیبایی</option>
                <option value="OTHER">سایر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                توضیحات
              </label>
              <textarea
                {...register("description")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                rows={3}
                placeholder="توضیحات نوبت..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                یادداشت‌ها
              </label>
              <textarea
                {...register("notes")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                rows={3}
                placeholder="یادداشت‌های اضافی..."
              />
            </div>

            <div className="flex justify-start gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isSubmitting ? "در حال ذخیره..." : appointment ? "به‌روزرسانی نوبت" : "ایجاد نوبت"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                لغو
              </Button>
            </div>
          </form>
      </div>
    </PositionedModal>
  );
}
