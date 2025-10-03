"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StaffList } from "@/components/staff/staff-list";
import { StaffForm } from "@/components/staff/staff-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formTriggerElement, setFormTriggerElement] = useState<HTMLElement | null>(null);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleStaffCreated = () => {
    setIsFormOpen(false);
    setEditingStaff(null);
    fetchStaff();
  };

  const handleEditStaff = (staffMember: StaffMember, triggerElement?: HTMLElement) => {
    setEditingStaff(staffMember);
    setFormTriggerElement(triggerElement || null);
    setIsFormOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-in-right">مدیریت کارمندان</h1>
            <p className="text-sm sm:text-base text-gray-600 animate-slide-in-right animation-delay-500">مدیریت اعضای کارمندان کلینیک</p>
          </div>
          <div className="animate-slide-in-left animation-delay-500">
            <Button 
              onClick={(e) => {
                setFormTriggerElement(e.currentTarget);
                setIsFormOpen(true);
              }} 
              className="w-full sm:w-auto hover-lift "
            >
              <Plus className="h-4 w-4 ml-2" />
              افزودن کارمند
            </Button>
          </div>
        </div>

        <div className="animate-bounce-in animation-delay-1000">
          <StaffList 
            staff={staff} 
            onEdit={handleEditStaff}
            onRefresh={fetchStaff}
          />
        </div>

        {isFormOpen && (
          <StaffForm
            isOpen={isFormOpen}
            staff={editingStaff}
            triggerElement={formTriggerElement}
            onClose={() => {
              setIsFormOpen(false);
              setEditingStaff(null);
              setFormTriggerElement(null);
            }}
            onSuccess={handleStaffCreated}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
