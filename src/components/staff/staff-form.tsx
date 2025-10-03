"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PositionedModal } from "@/components/ui/positioned-modal";
import { User, Mail, Lock, Shield } from "lucide-react";

const staffSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().optional(),
  role: z.string().min(1, "نقش الزامی است"),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  isOpen: boolean;
  staff?: any;
  triggerElement?: HTMLElement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function StaffForm({ isOpen, staff, triggerElement, onClose, onSuccess }: StaffFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: staff ? {
      name: staff.name || "",
      email: staff.email || "",
      password: "",
      role: staff.role || "RECEPTIONIST",
    } : {
      role: "RECEPTIONIST",
    },
  });

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    
    try {
      const url = staff ? `/api/staff/${staff.id}` : "/api/staff";
      const method = staff ? "PUT" : "POST";
      
      // For new staff, password is required
      if (!staff && (!data.password || data.password.trim() === "")) {
        toast.error("رمز عبور برای کارمند جدید الزامی است");
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(staff ? "کارمند با موفقیت به‌روزرسانی شد" : "کارمند با موفقیت ایجاد شد");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "خطا در ذخیره کارمند");
      }
    } catch (error) {
      toast.error("خطا در ذخیره کارمند");
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
        <div className="text-right w-full">
          {staff ? "ویرایش کارمند" : "افزودن کارمند جدید"}
        </div>
      }
      maxWidth="650px"
    >
      <div className="p-8 w-[550px] mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 flex-row-reverse justify-end">
              <span>نام *</span>
              <User className="h-4 w-4" />
            </label>
            <Input
              {...register("name")}
              placeholder="نام کامل را وارد کنید"
              className="text-right"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 text-right">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 flex-row-reverse justify-end">
              <span>ایمیل *</span>
              <Mail className="h-4 w-4" />
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="آدرس ایمیل را وارد کنید"
              className="text-right"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 text-right">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 flex-row-reverse justify-end">
              <span>رمز عبور {!staff && "*"}</span>
              <Lock className="h-4 w-4" />
            </label>
            <Input
              {...register("password")}
              type="password"
              placeholder={staff ? "برای نگه داشتن رمز فعلی خالی بگذارید" : "رمز عبور را وارد کنید"}
              className="text-right"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 text-right">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 flex-row-reverse justify-end">
              <span>نقش *</span>
              <Shield className="h-4 w-4" />
            </label>
            <select
              {...register("role")}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right bg-white"
              dir="rtl"
            >
              <option value="RECEPTIONIST">منشی</option>
              <option value="DOCTOR">دندانپزشک</option>
              <option value="ADMIN">مدیر</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1 text-right">{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-start gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSubmitting ? "در حال ذخیره..." : staff ? "به‌روزرسانی کارمند" : "ایجاد کارمند"}
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
