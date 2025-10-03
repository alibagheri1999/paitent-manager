"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const settingsSchema = z.object({
  clinicName: z.string().min(1, "نام کلینیک الزامی است"),
  address: z.string().min(1, "آدرس الزامی است"),
  phone: z.string().min(1, "شماره تلفن الزامی است"),
  email: z.string().email("ایمیل نامعتبر است"),
  website: z.string().optional(),
  workingHours: z.string().min(1, "ساعات کاری الزامی است"),
  timezone: z.string().min(1, "منطقه زمانی الزامی است"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      clinicName: "DentalCare Clinic",
      address: "123 Medical Street, Health City, HC 12345",
      phone: "+1 (555) 123-4567",
      email: "info@dentalcare.com",
      website: "www.dentalcare.com",
      workingHours: "9:00 AM - 6:00 PM",
      timezone: "America/New_York",
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, this would save to the database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("تنظیمات با موفقیت ذخیره شد");
    } catch (error) {
      toast.error("خطا در ذخیره تنظیمات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="text-right text-lg">اطلاعات کلینیک</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                نام کلینیک *
              </label>
              <Input
                {...register("clinicName")}
                placeholder="نام کلینیک را وارد کنید"
                className="text-right"
              />
              {errors.clinicName && (
                <p className="text-red-500 text-sm mt-1 text-right">{errors.clinicName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                آدرس *
              </label>
              <Input
                {...register("address")}
                placeholder="آدرس کلینیک را وارد کنید"
                className="text-right"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1 text-right">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  ایمیل *
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="ایمیل کلینیک"
                  dir="ltr"
                  className="text-center"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  تلفن *
                </label>
                <Input
                  {...register("phone")}
                  placeholder="شماره تلفن"
                  dir="ltr"
                  className="text-center"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 text-right">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                وب‌سایت
              </label>
              <Input
                {...register("website")}
                placeholder="آدرس وب‌سایت"
                dir="ltr"
                className="text-center"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSubmitting ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className="text-right text-lg">ساعات کاری و ترجیحات</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                ساعات کاری *
              </label>
              <Input
                {...register("workingHours")}
                placeholder="مثال: ۹:۰۰ صبح - ۶:۰۰ عصر"
                className="text-right"
              />
              {errors.workingHours && (
                <p className="text-red-500 text-sm mt-1 text-right">{errors.workingHours.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                منطقه زمانی *
              </label>
              <select
                {...register("timezone")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
              >
                <option value="Asia/Tehran">تهران (ایران)</option>
                <option value="America/New_York">نیویورک (ET)</option>
                <option value="America/Chicago">شیکاگو (CT)</option>
                <option value="America/Los_Angeles">لس‌آنجلس (PT)</option>
                <option value="Europe/London">لندن (GMT)</option>
                <option value="Europe/Paris">پاریس (CET)</option>
                <option value="Asia/Dubai">دبی (GST)</option>
                <option value="Asia/Tokyo">توکیو (JST)</option>
              </select>
              {errors.timezone && (
                <p className="text-red-500 text-sm mt-1 text-right">{errors.timezone.message}</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">تنظیمات اطلاع‌رسانی</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                  />
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-gray-700">اطلاع‌رسانی ایمیل</p>
                    <p className="text-xs text-gray-500">دریافت اطلاع‌رسانی ایمیل برای نوبت‌ها</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                  />
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-gray-700">اطلاع‌رسانی پیامکی</p>
                    <p className="text-xs text-gray-500">دریافت پیامک برای نوبت‌ها</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
                  />
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium text-gray-700">یادآوری نوبت</p>
                    <p className="text-xs text-gray-500">ارسال خودکار یادآوری نوبت</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
