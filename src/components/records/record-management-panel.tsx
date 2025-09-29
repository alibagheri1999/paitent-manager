"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, FileText, Calendar, DollarSign, User, Edit, Download, 
  Trash2, Eye, Clock, CheckCircle, XCircle, Plus
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { RecordForm } from "./record-form";
import { PaymentStepsManager } from "../payments/payment-steps-manager";

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

interface RecordManagementPanelProps {
  record: Record | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function RecordManagementPanel({ record, onClose, onRefresh }: RecordManagementPanelProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!record) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/records/${record.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Record deleted successfully");
        onRefresh();
        onClose();
      } else {
        toast.error("Failed to delete record");
      }
    } catch (error) {
      toast.error("Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/records/${record?.id}/files/${fileId}/download`);
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
        toast.success("File downloaded successfully");
      } else {
        toast.error("Failed to download file");
      }
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {record.treatmentType}
              </h2>
              <p className="text-sm text-gray-500">
                Treatment Record - {record.patient.firstName} {record.patient.lastName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            {/* Record Details Tab */}
            <TabsContent value="details" className="mt-6">
              {isEditing ? (
                <RecordForm
                  record={record}
                  onClose={() => setIsEditing(false)}
                  onSuccess={() => {
                    setIsEditing(false);
                    onRefresh();
                  }}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Record Information</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Treatment Type</p>
                            <p className="text-gray-900">{record.treatmentType}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Patient</p>
                            <p className="text-gray-900">{record.patient.firstName} {record.patient.lastName}</p>
                            {record.patient.phone && (
                              <p className="text-sm text-gray-500">{record.patient.phone}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Date</p>
                            <p className="text-gray-900">{formatDate(new Date(record.date))}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Cost</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(record.cost)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Badge className={record.isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {record.isCompleted ? "Completed" : "In Progress"}
                            </Badge>
                            <Badge className={record.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {record.paymentStatus || "UNPAID"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Created</p>
                            <p className="text-gray-900">{formatDate(new Date(record.createdAt))}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                      <p className="text-gray-900">{record.description}</p>
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <p className="text-gray-900">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Attached Files</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {record.files && record.files.length > 0 ? (
                    <div className="space-y-4">
                      {record.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{file.originalName}</p>
                              <p className="text-sm text-gray-500">
                                {(file.fileSize / 1024).toFixed(1)} KB • {file.mimeType}
                              </p>
                              <p className="text-xs text-gray-400">
                                Added {formatDate(new Date(file.createdAt))}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(file.id, file.originalName)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No files attached</p>
                      <p className="text-sm text-gray-400 mt-1">Files can be added when editing the record</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Payment Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentStepsManager
                    recordId={record.id}
                    recordCost={record.cost}
                    onUpdate={() => {
                      onRefresh();
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
