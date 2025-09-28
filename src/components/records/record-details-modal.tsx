"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, User, Calendar, DollarSign, FileText, Clock, CheckCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Record {
  id: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  treatmentType: string;
  description: string;
  cost: number;
  date: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecordDetailsModalProps {
  record: Record;
  onClose: () => void;
}

export function RecordDetailsModal({ record, onClose }: RecordDetailsModalProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Treatment Record Details</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Patient Information</span>
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Patient Name</label>
              <p className="text-gray-900">{record.patient.firstName} {record.patient.lastName}</p>
            </div>
          </div>

          {/* Treatment Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Treatment Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Treatment Type</label>
                <div>
                  <Badge className={getTreatmentTypeColor(record.treatmentType)}>
                    {record.treatmentType.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div>
                  <Badge variant={record.isCompleted ? "default" : "secondary"}>
                    {record.isCompleted ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Treatment Date</label>
                <p className="text-gray-900">{formatDate(new Date(record.date))}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>Cost</span>
                </label>
                <p className="text-gray-900 font-semibold text-green-600">
                  {formatCurrency(record.cost)}
                </p>
              </div>
            </div>
          </div>

          {/* Treatment Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Treatment Details</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {record.description}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {record.notes || "No additional notes"}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>System Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Created Date</label>
                <p className="text-gray-900">{formatDate(new Date(record.createdAt))}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{formatDate(new Date(record.updatedAt))}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t mt-6">
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
