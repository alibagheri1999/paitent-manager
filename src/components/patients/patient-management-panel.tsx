"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Phone, Hash, Calendar, MapPin, 
  FileText, Clock, MessageSquare, Send, Edit, History, Plus,
  DollarSign, Trash2, Download
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { translateTreatmentType, translatePaymentStatus } from "@/lib/translate-enums";
import { toast } from "sonner";
import { PositionedModal } from "@/components/ui/positioned-modal";
import { PatientForm } from "./patient-form";
import { RecordForm } from "../records/record-form";
import { PaymentStepsManager } from "../payments/payment-steps-manager";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  insuranceGroup?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Record {
  id: string;
  patientId: string;
  treatmentType: string;
  description: string;
  cost: number;
  date: string;
  notes?: string;
  isCompleted: boolean;
  paymentStatus?: string;
  paymentType?: string;
  files?: any[];
  createdAt: string;
  updatedAt: string;
}

interface PatientManagementPanelProps {
  patient: Patient | null;
  onClose: () => void;
  onRefresh: () => void;
  triggerElement?: HTMLElement | null;
}

export function PatientManagementPanel({ patient, onClose, onRefresh, triggerElement }: PatientManagementPanelProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormTrigger, setEditFormTrigger] = useState<HTMLElement | null>(null);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  useEffect(() => {
    if (patient) {
      fetchRecords();
    }
  }, [patient]);

  const fetchRecords = async () => {
    if (!patient) return;
    
    setIsLoadingRecords(true);
    try {
      const response = await fetch(`/api/patients/${patient.id}/records?page=1&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("لطفا پیام را وارد کنید");
      return;
    }

    if (!patient?.phone) {
      toast.error("شماره تلفن بیمار موجود نیست");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/patients/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: patient.id,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        toast.success("پیام با موفقیت ارسال شد");
        setMessage("");
        setShowMessageForm(false);
      } else {
        toast.error("خطا در ارسال پیام");
      }
    } catch (error) {
      toast.error("خطا در ارسال پیام");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید این پرونده را حذف کنید؟")) {
      try {
        const response = await fetch(`/api/records/${recordId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          toast.success("پرونده با موفقیت حذف شد");
          fetchRecords();
          onRefresh();
        } else {
          toast.error("خطا در حذف پرونده");
        }
      } catch (error) {
        toast.error("خطا در حذف پرونده");
      }
    }
  };

  const handleExportHistory = async () => {
    if (!patient) return;
    
    try {
      console.log("Exporting patient history for:", patient.id);
      const response = await fetch(`/api/export/patient-history/${patient.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تاریخچه_بیمار_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("تاریخچه بیمار با موفقیت خروجی گرفته شد!");
      } else {
        const errorData = await response.json();
        console.error("Export failed:", errorData);
        toast.error(errorData.error || "خطا در خروجی گرفتن تاریخچه بیمار");
      }
    } catch (error) {
      console.error("Error exporting patient history:", error);
      toast.error("خطای غیرمنتظره در خروجی گرفتن");
    }
  };

  const handleRecordCreated = () => {
    setIsCreatingRecord(false);
    setEditingRecord(null);
    fetchRecords();
    onRefresh();
  };

  const handleEditRecord = (record: Record) => {
    setEditingRecord(record);
    setIsCreatingRecord(true);
  };

  if (!patient) return null;

  return (
    <PositionedModal
      isOpen={true}
      onClose={onClose}
      triggerElement={triggerElement}
      title={`${patient.firstName} ${patient.lastName} - مدیریت بیمار`}
      maxWidth="900px"
    >
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm mb-6">
            <TabsTrigger value="details" className="text-xs sm:text-sm">جزئیات</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">تاریخچه</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs sm:text-sm">عملیات</TabsTrigger>
          </TabsList>

            {/* Patient Details Tab */}
            <TabsContent value="details">
              {isEditing ? (
                <PatientForm
                  patient={patient}
                  isOpen={isEditing}
                  triggerElement={editFormTrigger}
                  onClose={() => {
                    setIsEditing(false);
                    setEditFormTrigger(null);
                  }}
                  onSuccess={() => {
                    setIsEditing(false);
                    setEditFormTrigger(null);
                    onRefresh();
                  }}
                />
              ) : (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-center justify-between">
                      <Button onClick={(e) => {
                        setEditFormTrigger(e.currentTarget);
                        setIsEditing(true);
                      }} size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        ویرایش
                        <Edit className="h-4 w-4 mr-2" />
                      </Button>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        اطلاعات بیمار
                        <User className="h-5 w-5 text-blue-600" />
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-medium text-gray-600">نام کامل</p>
                            <p className="text-gray-900">{patient.firstName} {patient.lastName}</p>
                          </div>
                        </div>
                        
                        {patient.email && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-sm font-medium text-gray-600">ایمیل</p>
                              <p className="text-gray-900 break-all">{patient.email}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient.phone && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-sm font-medium text-gray-600">تلفن</p>
                              <p className="text-gray-900">{patient.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient.nationalId && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <Hash className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-sm font-medium text-gray-600">کد ملی</p>
                              <p className="text-gray-900">{patient.nationalId}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {patient.dateOfBirth && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-sm font-medium text-gray-600">تاریخ تولد</p>
                              <p className="text-gray-900">{formatDate(new Date(patient.dateOfBirth))}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient.address && (
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-sm font-medium text-gray-600">آدرس</p>
                              <p className="text-gray-900">{patient.address}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={patient.isActive ? "default" : "secondary"}>
                            {patient.isActive ? "فعال" : "غیرفعال"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            ثبت شده در {formatDate(new Date(patient.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Insurance Information */}
                    {(patient.insuranceProvider || patient.insuranceNumber || patient.insuranceGroup) && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-end gap-2">
                          اطلاعات بیمه
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {patient.insuranceProvider && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">شرکت بیمه</p>
                              <p className="text-gray-900">{patient.insuranceProvider}</p>
                            </div>
                          )}
                          {patient.insuranceNumber && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">شماره بیمه‌نامه</p>
                              <p className="text-gray-900">{patient.insuranceNumber}</p>
                            </div>
                          )}
                          {patient.insuranceGroup && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">شماره گروه</p>
                              <p className="text-gray-900">{patient.insuranceGroup}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Medical Information */}
                    {(patient.medicalHistory || patient.allergies) && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-end gap-2">
                          اطلاعات پزشکی
                          <FileText className="h-5 w-5 text-green-600" />
                        </h3>
                        <div className="space-y-4">
                          {patient.medicalHistory && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">سابقه پزشکی</p>
                              <p className="text-gray-900">{patient.medicalHistory}</p>
                            </div>
                          )}
                          {patient.allergies && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">حساسیت‌ها</p>
                              <p className="text-gray-900">{patient.allergies}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {(patient.emergencyContact || patient.emergencyPhone) && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center justify-end gap-2">
                          تماس اضطراری
                          <Phone className="h-5 w-5 text-red-600" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {patient.emergencyContact && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">نام تماس</p>
                              <p className="text-gray-900">{patient.emergencyContact}</p>
                            </div>
                          )}
                          {patient.emergencyPhone && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-600">تلفن تماس</p>
                              <p className="text-gray-900">{patient.emergencyPhone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {patient.notes && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-right">یادداشت‌ها</h3>
                        <p className="text-gray-900 text-right leading-relaxed">{patient.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Patient History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-2 sm:order-1">
                      <Button onClick={handleExportHistory} variant="outline" className="w-full sm:w-auto">
                        <span className="hidden sm:inline">خروجی تاریخچه</span>
                        <span className="sm:hidden">خروجی</span>
                        <Download className="h-4 w-4 mr-2" />
                      </Button>
                      <Button onClick={() => setIsCreatingRecord(true)} className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        <span className="hidden sm:inline">افزودن پرونده</span>
                        <span className="sm:hidden">افزودن</span>
                        <Plus className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                    <CardTitle className="flex items-center justify-end gap-2 text-lg sm:text-xl order-1 sm:order-2">
                      تاریخچه درمان
                      <History className="h-5 w-5 text-green-600" />
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {isCreatingRecord ? (
                    <RecordForm
                      defaultPatientId={patient.id}
                      record={editingRecord}
                      onClose={() => {
                        setIsCreatingRecord(false);
                        setEditingRecord(null);
                      }}
                      onSuccess={handleRecordCreated}
                    />
                  ) : (
                    <div className="space-y-4">
                      {isLoadingRecords ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">در حال بارگذاری پرونده‌ها...</p>
                        </div>
                      ) : records.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">پرونده درمانی یافت نشد</p>
                          <p className="text-sm text-gray-400 mt-1">برای شروع، پرونده جدید اضافه کنید</p>
                        </div>
                      ) : (
                        records.map((record) => (
                          <div key={record.id} className="border-2 rounded-lg p-4 hover:shadow-md transition-all bg-white">
                            <div className="flex flex-col gap-4">
                              {/* Header Row */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-2 order-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRecord(record.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                    title="حذف"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRecord(record)}
                                    className="h-8 w-8 p-0 hover:bg-blue-50"
                                    title="ویرایش"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="flex-1 order-1">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-1 text-right">
                                      <div className="flex flex-wrap items-center justify-end gap-2 mb-2">
                                        <Badge className={record.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                          {translatePaymentStatus(record.paymentStatus || "UNPAID")}
                                        </Badge>
                                        <Badge className={record.isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                          {record.isCompleted ? "تکمیل شده" : "در حال انجام"}
                                        </Badge>
                                        <h4 className="font-bold text-gray-900 text-base">
                                          {translateTreatmentType(record.treatmentType)}
                                        </h4>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                                      <div className="flex flex-wrap items-center justify-end gap-3 text-xs sm:text-sm text-gray-500">
                                        {record.files && record.files.length > 0 && (
                                          <span className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {record.files.length.toLocaleString('fa-IR')} فایل
                                          </span>
                                        )}
                                        <span className="font-bold text-green-600">{formatCurrency(record.cost)}</span>
                                        <span className="font-medium">{formatDate(new Date(record.date))}</span>
                                      </div>
                                    </div>
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      record.isCompleted ? 'bg-green-100' : 'bg-yellow-100'
                                    }`}>
                                      <FileText className={`h-5 w-5 ${
                                        record.isCompleted ? 'text-green-600' : 'text-yellow-600'
                                      }`} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Payment Steps */}
                              <div className="border-t pt-4">
                                <PaymentStepsManager
                                  recordId={record.id}
                                  recordCost={record.cost}
                                  onUpdate={() => {
                                    fetchRecords();
                                    onRefresh();
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Send Message */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <CardTitle className="flex items-center justify-end gap-2 text-lg">
                      ارسال پیام
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showMessageForm ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            پیام
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="پیام خود را وارد کنید..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSendMessage}
                            disabled={isSending || !message.trim()}
                            className="flex-1"
                          >
                            {isSending ? "در حال ارسال..." : "ارسال"}
                            <Send className="h-4 w-4 mr-2" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowMessageForm(false);
                              setMessage("");
                            }}
                          >
                            لغو
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">ارسال پیام به بیمار</p>
                        <Button onClick={() => setShowMessageForm(true)}>
                          ارسال پیام
                          <MessageSquare className="h-4 w-4 mr-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                    <CardTitle className="flex items-center justify-end gap-2 text-lg">
                      عملیات سریع
                      <Clock className="h-5 w-5 text-orange-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => {
                          setActiveTab("history");
                          setIsCreatingRecord(true);
                        }}
                      >
                        <span>افزودن پرونده درمان</span>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={(e) => {
                          setEditFormTrigger(e.currentTarget);
                          setIsEditing(true);
                        }}
                      >
                        <span>ویرایش اطلاعات بیمار</span>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setActiveTab("history")}
                      >
                        <span>مشاهده تاریخچه درمان</span>
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
      </div>
    </PositionedModal>
  );
}
