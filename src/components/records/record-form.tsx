"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUpload } from "./file-upload";
import { DateInputWithJalali } from "@/components/ui/date-input-with-jalali";
import { PositionedModal } from "@/components/ui/positioned-modal";

const recordSchema = z.object({
  patientId: z.string().min(1, "انتخاب بیمار الزامی است"),
  treatmentType: z.string().min(1, "نوع درمان الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  cost: z.number().min(0, "هزینه باید مثبت باشد"),
  date: z.string().min(1, "تاریخ الزامی است"),
  notes: z.string().optional(),
  isCompleted: z.boolean(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface RecordFormProps {
  isOpen: boolean;
  record?: any;
  triggerElement?: HTMLElement | null;
  onClose: () => void;
  onSuccess: () => void;
  defaultPatientId?: string | null;
}

export function RecordForm({ isOpen, record, triggerElement, onClose, onSuccess, defaultPatientId }: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recordId, setRecordId] = useState<string | null>(record?.id || null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: record ? {
      patientId: record.patientId || "",
      treatmentType: record.treatmentType || "",
      description: record.description || "",
      cost: record.cost || 0,
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : "",
      notes: record.notes || "",
      isCompleted: record.isCompleted || false,
    } : {
      patientId: defaultPatientId || "",
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      isCompleted: false,
    },
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients?limit=1000"); // Get all patients
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients || []); // Extract patients from pagination response
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        setPatients([]); // Set empty array on error
      }
    };

    fetchPatients();
  }, []);

  const onSubmit = async (data: RecordFormData) => {
    // Prevent duplicate submission if record already exists
    if (!record && recordId) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const url = record ? `/api/records/${record.id}` : "/api/records";
      const method = record ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        if (!record) {
          setRecordId(result.id);
        }
        toast.success(record ? "پرونده با موفقیت به‌روزرسانی شد" : "پرونده با موفقیت ایجاد شد");
        if (record) {
          onSuccess();
        } else {
          // For new records, don't call onSuccess immediately - let user upload files first
          // onSuccess will be called when user closes the form
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در ذخیره پرونده");
      }
    } catch (error) {
      toast.error("خطایی در ذخیره پرونده رخ داد");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PositionedModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      title={record ? "ویرایش پرونده" : "افزودن پرونده جدید"}
      maxWidth="800px"
    >
      <div className="overflow-y-auto max-h-[75vh] p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                بیمار <span className="text-red-500">*</span>
              </label>
              {defaultPatientId ? (
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-right">
                  {patients.find(p => p.id === defaultPatientId) ? (
                    <span className="text-gray-900">
                      {patients.find(p => p.id === defaultPatientId)?.firstName} {patients.find(p => p.id === defaultPatientId)?.lastName}
                    </span>
                  ) : (
                    <span className="text-gray-500">در حال بارگذاری بیمار...</span>
                  )}
                </div>
              ) : (
                <select
                  {...register("patientId")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب بیمار</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              )}
              {errors.patientId && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.patientId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                  نوع درمان <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("treatmentType")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">انتخاب نوع درمان</option>
                  <option value="CONSULTATION">مشاوره</option>
                  <option value="CLEANING">جرم‌گیری</option>
                  <option value="FILLING">ترمیم دندان</option>
                  <option value="EXTRACTION">کشیدن دندان</option>
                  <option value="CROWN">روکش دندان</option>
                  <option value="BRIDGE">بریج</option>
                  <option value="IMPLANT">ایمپلنت</option>
                  <option value="ROOT_CANAL">عصب‌کشی</option>
                  <option value="ORTHODONTICS">ارتودنسی</option>
                  <option value="COSMETIC">زیبایی</option>
                  <option value="OTHER">سایر</option>
                </select>
                {errors.treatmentType && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.treatmentType.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                  هزینه <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("cost", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="هزینه را وارد کنید"
                  className="focus:ring-2 focus:ring-blue-500"
                />
                {errors.cost && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.cost.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                تاریخ <span className="text-red-500">*</span>
              </label>
              <DateInputWithJalali
                value={watch("date")}
                onChange={(date) => setValue("date", date)}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                توضیحات <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
                placeholder="توضیحات درمان را وارد کنید"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                یادداشت‌ها
              </label>
              <textarea
                {...register("notes")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
                placeholder="یادداشت‌های اضافی"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register("isCompleted")}
                type="checkbox"
                id="isCompleted"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isCompleted" className="text-sm font-medium text-gray-700">
                علامت‌گذاری به عنوان تکمیل شده
              </label>
            </div>

            {/* File Upload Section - Show after record is created */}
            {recordId && (
              <div className="mt-8 pt-6 border-t bg-blue-50/30 -mx-6 px-6 py-6 rounded-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-right">پیوست فایل‌ها</h3>
                <FileUpload 
                  recordId={recordId} 
                  onFileUploaded={() => {
                    // Optional: refresh or update UI
                  }}
                />
                <div className="mt-4 text-sm text-gray-600 text-right">
                  <p>می‌توانید فایل به این پرونده پیوست کنید. پس از اتمام روی "تمام" کلیک کنید.</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t mt-6 sticky bottom-0 bg-white pb-2">
              <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]">
                لغو
              </Button>
              {!record && recordId ? (
                <Button type="button" onClick={onSuccess} className="min-w-[100px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  تمام
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال ذخیره...
                    </span>
                  ) : (
                    record ? "به‌روزرسانی پرونده" : "ایجاد پرونده"
                  )}
                </Button>
              )}
            </div>
          </form>
      </div>
    </PositionedModal>
  );
}
