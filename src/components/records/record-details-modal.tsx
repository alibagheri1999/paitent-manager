"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, User, Calendar, DollarSign, FileText, Clock, CheckCircle, Edit, Trash2, Download, Paperclip } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { RecordForm } from "./record-form";
import { PaymentStepsManager } from "@/components/payments/payment-steps-manager";
import { toast } from "sonner";

interface Record {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  treatmentType: string;
  description: string;
  cost: number;
  date: string;
  notes?: string;
  isCompleted: boolean;
  paymentStatus?: string;
  paymentType?: string;
  createdAt: string;
  updatedAt: string;
  files?: {
    id: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }[];
}

interface RecordDetailsModalProps {
  record: Record;
  onClose: () => void;
  onRefresh?: () => void;
}

export function RecordDetailsModal({ record, onClose, onRefresh }: RecordDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/records/${record.id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          toast.success("Record deleted successfully");
          onClose();
          if (onRefresh) onRefresh();
        } else {
          toast.error("Failed to delete record");
        }
      } catch (error) {
        console.error("Failed to delete record:", error);
        toast.error("Failed to delete record");
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    if (onRefresh) onRefresh();
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/records/${record.id}/files/${fileId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Treatment Record Details</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={handleEdit} className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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

          {/* Payment Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Payment Management</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <p className="text-gray-900">{record.paymentStatus || "UNPAID"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Payment Type</label>
                <p className="text-gray-900">{record.paymentType || "FULL_PAYMENT"}</p>
              </div>
            </div>
            
            {/* Payment Steps Manager */}
            <PaymentStepsManager
              recordId={record.id}
              recordCost={record.cost}
              onUpdate={onRefresh}
            />
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

          {/* Files Section */}
          {record.files && record.files.length > 0 && (
            <div className="pt-4 border-t mt-4 space-y-3">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <Paperclip className="h-5 w-5" />
                <span>Attached Files</span>
              </h3>
              <div className="space-y-2">
                {record.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900">{file.originalName}</p>
                        <p className="text-sm text-gray-500">
                          {(file.fileSize / 1024).toFixed(1)} KB • {formatDate(new Date(file.uploadedAt))}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(file.id, file.originalName)}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Edit Modal */}
      {showEditModal && record && (
        <RecordForm
          isOpen={showEditModal}
          record={record}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          defaultPatientId={record.patient.id}
          triggerElement={null}
        />
      )}
    </div>
  );
}
