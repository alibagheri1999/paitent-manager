"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Trash2, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { translateStaffRole } from "@/lib/translate-enums";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface StaffListProps {
  staff: StaffMember[];
  onEdit: (staff: StaffMember, triggerElement?: HTMLElement) => void;
  onRefresh: () => void;
}

export function StaffList({ staff, onEdit, onRefresh }: StaffListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStaff, setFilteredStaff] = useState(staff);

  useEffect(() => {
    const filtered = staff.filter(staffMember =>
      staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staffMember.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [staff, searchTerm]);

  const handleDelete = async (staffId: string) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید این کارمند را حذف کنید؟")) {
      try {
        const response = await fetch(`/api/staff/${staffId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          onRefresh();
        }
      } catch (error) {
        console.error("Failed to delete staff member:", error);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "DOCTOR":
        return "bg-blue-100 text-blue-800";
      case "RECEPTIONIST":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجوی کارمندان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">کارمندی یافت نشد</p>
            </div>
          ) : (
            filteredStaff.map((staffMember) => (
              <div key={staffMember.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 text-right">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {staffMember.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {staffMember.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2 justify-end flex-wrap">
                          <span className="text-xs text-gray-400">
                            عضویت: {formatDate(new Date(staffMember.createdAt))}
                          </span>
                          <Badge className={getRoleColor(staffMember.role)}>
                            {translateStaffRole(staffMember.role)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => onEdit(staffMember, e.currentTarget)}
                      className="h-9 w-9"
                      title="ویرایش"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(staffMember.id)}
                      className="text-red-600 hover:text-red-700 h-9 w-9"
                      title="حذف"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
