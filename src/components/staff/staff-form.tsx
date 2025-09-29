"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  role: z.string().min(1, "Role is required"),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  staff?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function StaffForm({ staff, onClose, onSuccess }: StaffFormProps) {
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
        toast.error("Password is required for new staff members");
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
        toast.success(staff ? "Staff member updated successfully" : "Staff member created successfully");
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save staff member");
      }
    } catch (error) {
      toast.error("An error occurred while saving the staff member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{staff ? "Edit Staff Member" : "Add New Staff Member"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                {...register("name")}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!staff && "*"}
              </label>
              <Input
                {...register("password")}
                type="password"
                placeholder={staff ? "Leave blank to keep current password" : "Enter password"}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                {...register("role")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : staff ? "Update Staff" : "Create Staff"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
