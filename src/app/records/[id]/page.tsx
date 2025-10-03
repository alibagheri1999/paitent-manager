"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Calendar, Tag, DollarSign, FileText, MessageSquare, Clock, CheckCircle, Edit, Trash2, Download, Paperclip } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { RecordForm } from "@/components/records/record-form";

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

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;
  
  const [record, setRecord] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/records/${recordId}`);
        if (response.ok) {
          const data = await response.json();
          setRecord(data);
        } else {
          toast.error("Failed to fetch record details.");
        }
      } catch (error) {
        console.error("Error fetching record:", error);
        toast.error("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

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

  const handleEdit = () => {
    // Open edit modal
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/records/${recordId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          toast.success("Record deleted successfully");
          router.push(`/patients/${record?.patient.id}/history`);
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
    // Refresh the record data
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/records/${recordId}`);
        if (response.ok) {
          const data = await response.json();
          setRecord(data);
        }
      } catch (error) {
        console.error("Error fetching record:", error);
      }
    };
    fetchRecord();
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/records/${recordId}/files/${fileId}/download`);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading record details...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Record not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/patients/${record.patient.id}/history`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Patient</span>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Treatment Record</h1>
          </div>
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
          </div>
        </div>
      </div>

      {/* Record Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Treatment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Patient:</span>
              <span>{record.patient.firstName} {record.patient.lastName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Date:</span>
              <span>{formatDate(new Date(record.date))}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Treatment Type:</span>
              <Badge className={getTreatmentTypeColor(record.treatmentType)}>
                {record.treatmentType.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Cost:</span>
              <span className="font-medium text-green-600">{formatCurrency(record.cost)}</span>
            </div>
            <div className="flex items-center space-x-2 col-span-full">
              <CheckCircle className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Status:</span>
              <Badge variant={record.isCompleted ? "default" : "secondary"}>
                {record.isCompleted ? "Completed" : "Pending"}
              </Badge>
            </div>
          </div>

          {record.description && (
            <div>
              <h4 className="font-medium text-gray-700 flex items-center space-x-2 mb-1">
                <FileText className="h-4 w-4" />
                <span>Description:</span>
              </h4>
              <p className="text-gray-600 pl-6">{record.description}</p>
            </div>
          )}

          {record.notes && (
            <div>
              <h4 className="font-medium text-gray-700 flex items-center space-x-2 mb-1">
                <MessageSquare className="h-4 w-4" />
                <span>Notes:</span>
              </h4>
              <p className="text-gray-600 pl-6">{record.notes}</p>
            </div>
          )}

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

          <div className="pt-4 border-t mt-4 space-y-3">
            <h3 className="font-semibold text-lg">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Created:</span>
                <p className="text-gray-900">{formatDate(new Date(record.createdAt))}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Last Updated:</span>
                <p className="text-gray-900">{formatDate(new Date(record.updatedAt))}</p>
              </div>
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
