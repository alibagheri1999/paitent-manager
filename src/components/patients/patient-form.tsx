"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { PositionedModal } from "@/components/ui/positioned-modal";
import { DateInputWithJalali } from "@/components/ui/date-input-with-jalali";

const patientSchema = z.object({
  firstName: z.string().min(1, "نام الزامی است"),
  lastName: z.string().min(1, "نام خانوادگی الزامی است"),
  email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("")),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceGroup: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: any;
  onClose: () => void;
  onSuccess: () => void;
  isOpen: boolean;
  triggerElement?: HTMLElement | null;
}

export function PatientForm({ patient, onClose, onSuccess, isOpen, triggerElement }: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || "",
      phone: patient.phone || "",
      nationalId: patient.nationalId || "",
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
      medicalHistory: patient.medicalHistory || "",
      allergies: patient.allergies || "",
      insuranceProvider: patient.insuranceProvider || "",
      insuranceNumber: patient.insuranceNumber || "",
      insuranceGroup: patient.insuranceGroup || "",
      notes: patient.notes || "",
    } : {},
  });

  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email || "",
        phone: patient.phone || "",
        nationalId: patient.nationalId || "",
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
        address: patient.address || "",
        emergencyContact: patient.emergencyContact || "",
        emergencyPhone: patient.emergencyPhone || "",
        medicalHistory: patient.medicalHistory || "",
        allergies: patient.allergies || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        insuranceGroup: patient.insuranceGroup || "",
        notes: patient.notes || "",
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    
    try {
      const url = patient ? `/api/patients/${patient.id}` : "/api/patients";
      const method = patient ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(patient ? "بیمار با موفقیت به‌روزرسانی شد" : "بیمار با موفقیت ایجاد شد");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در ذخیره بیمار");
      }
    } catch (error) {
      toast.error("خطایی در ذخیره بیمار رخ داد");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PositionedModal
      isOpen={isOpen}
      onClose={onClose}
      triggerElement={triggerElement}
      title={patient ? "ویرایش بیمار" : "افزودن بیمار جدید"}
      maxWidth="800px"
    >
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نام <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("firstName")}
                  placeholder="نام را وارد کنید"
                  className="focus:ring-2 focus:ring-blue-500"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.firstName.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  نام خانوادگی <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("lastName")}
                  placeholder="نام خانوادگی را وارد کنید"
                  className="focus:ring-2 focus:ring-blue-500"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ایمیل
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="ایمیل را وارد کنید"
                  className="focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.email.message}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تلفن
                </label>
                <Input
                  {...register("phone")}
                  placeholder="شماره تلفن را وارد کنید"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  کد ملی
                </label>
                <Input
                  {...register("nationalId")}
                  placeholder="کد ملی را وارد کنید"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تاریخ تولد
                </label>
                <DateInputWithJalali
                  value={watch("dateOfBirth")}
                  onChange={(date) => setValue("dateOfBirth", date)}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                آدرس
              </label>
              <Input
                {...register("address")}
                placeholder="آدرس را وارد کنید"
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تماس اضطراری
                </label>
                <Input
                  {...register("emergencyContact")}
                  placeholder="نام تماس اضطراری"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تلفن اضطراری
                </label>
                <Input
                  {...register("emergencyPhone")}
                  placeholder="شماره تلفن اضطراری"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                سابقه پزشکی
              </label>
              <textarea
                {...register("medicalHistory")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
                placeholder="سابقه پزشکی را وارد کنید"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                حساسیت‌ها
              </label>
              <textarea
                {...register("allergies")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
                placeholder="حساسیت‌های شناخته شده را وارد کنید"
              />
            </div>

            {/* Insurance Information Section */}
            <div className="border-t pt-6 mt-6 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 -mx-6 px-6 py-6 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                اطلاعات بیمه
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    شرکت بیمه
                  </label>
                  <Input
                    {...register("insuranceProvider")}
                    placeholder="مثال: ایران، البرز، پاسارگاد"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    شماره بیمه
                  </label>
                  <Input
                    {...register("insuranceNumber")}
                    placeholder="شماره بیمه‌نامه"
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  شماره گروه
                </label>
                <Input
                  {...register("insuranceGroup")}
                  placeholder="شماره گروه یا طرح"
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                یادداشت‌ها
              </label>
              <textarea
                {...register("notes")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
                placeholder="یادداشت‌های اضافی"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="min-w-[100px]"
              >
                لغو
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    در حال ذخیره...
                  </span>
                ) : (
                  patient ? "به‌روزرسانی بیمار" : "ایجاد بیمار"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
    </PositionedModal>
  );
}
