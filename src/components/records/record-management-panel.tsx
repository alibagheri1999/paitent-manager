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
import { translateTreatmentType, translatePaymentStatus } from "@/lib/translate-enums";
import { toast } from "sonner";
import { RecordForm } from "./record-form";
import { PaymentStepsManager } from "../payments/payment-steps-manager";
import { PositionedModal } from "@/components/ui/positioned-modal";

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
  triggerElement?: HTMLElement | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function RecordManagementPanel({ record, triggerElement, onClose, onRefresh }: RecordManagementPanelProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormTrigger, setEditFormTrigger] = useState<HTMLElement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!record) return;
    
    if (!confirm("آیا مطمئن هستید که می‌خواهید این پرونده را حذف کنید؟")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/records/${record.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("پرونده با موفقیت حذف شد");
        onRefresh();
        onClose();
      } else {
        toast.error("خطا در حذف پرونده");
      }
    } catch (error) {
      toast.error("خطا در حذف پرونده");
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
        toast.success("فایل با موفقیت دانلود شد");
      } else {
        toast.error("خطا در دانلود فایل");
      }
    } catch (error) {
      toast.error("خطا در دانلود فایل");
    }
  };

  if (!record) return null;

  return (
    <PositionedModal
      isOpen={true}
      onClose={onClose}
      triggerElement={triggerElement}
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold">{translateTreatmentType(record.treatmentType)}</h3>
            <p className="text-sm text-gray-600">
              {record.patient.firstName} {record.patient.lastName}
            </p>
          </div>
        </div>
      }
      maxWidth="900px"
    >
      <div className="overflow-y-auto max-h-[75vh] p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">جزئیات</TabsTrigger>
              <TabsTrigger value="files">فایل‌ها</TabsTrigger>
              <TabsTrigger value="payments">پرداخت‌ها</TabsTrigger>
            </TabsList>

            {/* Record Details Tab */}
            <TabsContent value="details" className="mt-6">
              {isEditing ? (
                <RecordForm
                  isOpen={isEditing}
                  record={record}
                  triggerElement={editFormTrigger}
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
                      <CardTitle className="flex items-center gap-2 text-right">
                        <span>اطلاعات پرونده</span>
                        <FileText className="h-5 w-5" />
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          <span>{isDeleting ? "در حال حذف..." : "حذف"}</span>
                          <Trash2 className="h-4 w-4 ml-2" />
                        </Button>
                        <Button onClick={(e) => {
                            setEditFormTrigger(e.currentTarget);
                            setIsEditing(true);
                          }}>
                          <span>ویرایش</span>
                          <Edit className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div className="text-right flex-1">
                            <p className="text-sm font-medium text-gray-600">نوع درمان</p>
                            <p className="text-gray-900">{translateTreatmentType(record.treatmentType)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <User className="h-5 w-5 text-gray-400" />
                          <div className="text-right flex-1">
                            <p className="text-sm font-medium text-gray-600">بیمار</p>
                            <p className="text-gray-900">{record.patient.firstName} {record.patient.lastName}</p>
                            {record.patient.phone && (
                              <p className="text-sm text-gray-500">{record.patient.phone}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div className="text-right flex-1">
                            <p className="text-sm font-medium text-gray-600">تاریخ</p>
                            <p className="text-gray-900">{formatDate(new Date(record.date))}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                          <div className="text-right flex-1">
                            <p className="text-sm font-medium text-gray-600">هزینه</p>
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(record.cost)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="flex items-center gap-2">
                            <Badge className={record.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {translatePaymentStatus(record.paymentStatus || "UNPAID")}
                            </Badge>
                            <Badge className={record.isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {record.isCompleted ? "تکمیل شده" : "در حال انجام"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div className="text-right flex-1">
                            <p className="text-sm font-medium text-gray-600">تاریخ ایجاد</p>
                            <p className="text-gray-900">{formatDate(new Date(record.createdAt))}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">توضیحات</h3>
                      <p className="text-gray-900 text-right">{record.description}</p>
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">یادداشت‌ها</h3>
                        <p className="text-gray-900 text-right">{record.notes}</p>
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
                  <CardTitle className="flex items-center gap-2 text-right">
                    <span>فایل‌های پیوست</span>
                    <FileText className="h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {record.files && record.files.length > 0 ? (
                    <div className="space-y-4">
                      {record.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadFile(file.id, file.originalName)}
                          >
                            <span>دانلود</span>
                            <Download className="h-4 w-4 ml-2" />
                          </Button>
                          <div className="flex items-center gap-3 flex-1 justify-end">
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{file.originalName}</p>
                              <p className="text-sm text-gray-500">
                                {(file.fileSize / 1024).toFixed(1)} KB • {file.mimeType}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(new Date(file.createdAt))}
                              </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">فایلی پیوست نشده است</p>
                      <p className="text-sm text-gray-400 mt-1">می‌توانید هنگام ویرایش پرونده، فایل اضافه کنید</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-right">
                    <span>مدیریت پرداخت</span>
                    <DollarSign className="h-5 w-5" />
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
    </PositionedModal>
  );
}
