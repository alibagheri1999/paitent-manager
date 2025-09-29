"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { RecordManagementPanel } from "./record-management-panel";

interface Record {
  id: string;
  patientId: string;
  patient: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  treatmentType: string;
  description: string;
  cost: number;
  date: string;
  notes?: string;
  isCompleted: boolean;
  paymentStatus?: string;
  paymentType?: string;
  files?: {
    id: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface RecordsListProps {
  records: Record[];
  onEdit: (record: Record) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function RecordsList({ records, onEdit, onRefresh, isLoading }: RecordsListProps) {
  const [viewingRecord, setViewingRecord] = useState<Record | null>(null);

  const handleDelete = async (recordId: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/records/${recordId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          onRefresh();
        }
      } catch (error) {
        console.error("Failed to delete record:", error);
      }
    }
  };

  const getTreatmentTypeColor = (type: string) => {
    switch (type) {
      case "CONSULTATION":
        return "bg-blue-100 text-blue-800";
      case "CLEANING":
        return "bg-green-100 text-green-800";
      case "FILLING":
        return "bg-yellow-100 text-yellow-800";
      case "EXTRACTION":
        return "bg-red-100 text-red-800";
      case "CROWN":
        return "bg-purple-100 text-purple-800";
      case "BRIDGE":
        return "bg-indigo-100 text-indigo-800";
      case "IMPLANT":
        return "bg-pink-100 text-pink-800";
      case "ROOT_CANAL":
        return "bg-orange-100 text-orange-800";
      case "ORTHODONTICS":
        return "bg-teal-100 text-teal-800";
      case "COSMETIC":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No records found</p>
            </div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                            {record.patient.firstName} {record.patient.lastName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={getTreatmentTypeColor(record.treatmentType)}>
                              {record.treatmentType.replace("_", " ")}
                            </Badge>
                            <Badge variant={record.isCompleted ? "default" : "secondary"}>
                              {record.isCompleted ? "Completed" : "Pending"}
                            </Badge>
                            {record.paymentStatus && (
                              <Badge className={record.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {record.paymentStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {record.description}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-500">
                          <span>{formatDate(new Date(record.date))}</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(record.cost)}
                          </span>
                          {record.files && record.files.length > 0 && (
                            <span>{record.files.length} file{record.files.length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setViewingRecord(record)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(record)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {viewingRecord && (
        <RecordManagementPanel
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
          onRefresh={onRefresh}
        />
      )}
    </Card>
  );
}
