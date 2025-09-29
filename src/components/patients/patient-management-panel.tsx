"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, User, Mail, Phone, Hash, Calendar, MapPin, AlertTriangle, 
  FileText, Clock, MessageSquare, Send, Edit, History, Plus,
  DollarSign, Eye, Trash2, Download
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
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
}

export function PatientManagementPanel({ patient, onClose, onRefresh }: PatientManagementPanelProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
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
      toast.error("Please enter a message");
      return;
    }

    if (!patient?.phone) {
      toast.error("Patient phone number not available");
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
        toast.success("Message sent successfully");
        setMessage("");
        setShowMessageForm(false);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/records/${recordId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          toast.success("Record deleted successfully");
          fetchRecords();
          onRefresh();
        } else {
          toast.error("Failed to delete record");
        }
      } catch (error) {
        toast.error("Failed to delete record");
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
        a.download = `patient_history_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Patient history exported successfully!");
      } else {
        const errorData = await response.json();
        console.error("Export failed:", errorData);
        toast.error(errorData.error || "Failed to export patient history.");
      }
    } catch (error) {
      console.error("Error exporting patient history:", error);
      toast.error("An unexpected error occurred during export.");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] lg:max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Patient Management
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="self-end sm:self-auto">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
              <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
              <TabsTrigger value="actions" className="text-xs sm:text-sm">Actions</TabsTrigger>
            </TabsList>

            {/* Patient Details Tab */}
            <TabsContent value="details" className="mt-6">
              {isEditing ? (
                <PatientForm
                  patient={patient}
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
                        <User className="h-5 w-5" />
                        <span>Patient Information</span>
                      </CardTitle>
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-600">Full Name</p>
                            <p className="text-gray-900">{patient.firstName} {patient.lastName}</p>
                          </div>
                        </div>
                        
                        {patient.email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">Email</p>
                              <p className="text-gray-900">{patient.email}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">Phone</p>
                              <p className="text-gray-900">{patient.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient.nationalId && (
                          <div className="flex items-center space-x-3">
                            <Hash className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">National ID</p>
                              <p className="text-gray-900">{patient.nationalId}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {patient.dateOfBirth && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                              <p className="text-gray-900">{formatDate(new Date(patient.dateOfBirth))}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient.address && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-600">Address</p>
                              <p className="text-gray-900">{patient.address}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant={patient.isActive ? "default" : "secondary"}>
                            {patient.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Added {formatDate(new Date(patient.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Insurance Information */}
                    {(patient.insuranceProvider || patient.insuranceNumber || patient.insuranceGroup) && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {patient.insuranceProvider && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Provider</p>
                              <p className="text-gray-900">{patient.insuranceProvider}</p>
                            </div>
                          )}
                          {patient.insuranceNumber && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Policy Number</p>
                              <p className="text-gray-900">{patient.insuranceNumber}</p>
                            </div>
                          )}
                          {patient.insuranceGroup && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Group Number</p>
                              <p className="text-gray-900">{patient.insuranceGroup}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Medical Information */}
                    {(patient.medicalHistory || patient.allergies) && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                        <div className="space-y-4">
                          {patient.medicalHistory && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Medical History</p>
                              <p className="text-gray-900">{patient.medicalHistory}</p>
                            </div>
                          )}
                          {patient.allergies && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Allergies</p>
                              <p className="text-gray-900">{patient.allergies}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {(patient.emergencyContact || patient.emergencyPhone) && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {patient.emergencyContact && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Contact Name</p>
                              <p className="text-gray-900">{patient.emergencyContact}</p>
                            </div>
                          )}
                          {patient.emergencyPhone && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Contact Phone</p>
                              <p className="text-gray-900">{patient.emergencyPhone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {patient.notes && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                        <p className="text-gray-900">{patient.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Patient History Tab */}
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                      <History className="h-5 w-5" />
                      <span>Treatment History</span>
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button onClick={handleExportHistory} variant="outline" className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Export History</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                      <Button onClick={() => setIsCreatingRecord(true)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Record</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </div>
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
                          <p className="text-gray-500">Loading records...</p>
                        </div>
                      ) : records.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No treatment records found</p>
                          <p className="text-sm text-gray-400 mt-1">Add a new record to get started</p>
                        </div>
                      ) : (
                        records.map((record) => (
                          <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    record.isCompleted ? 'bg-green-100' : 'bg-yellow-100'
                                  }`}>
                                    <FileText className={`h-5 w-5 ${
                                      record.isCompleted ? 'text-green-600' : 'text-yellow-600'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                        {record.treatmentType}
                                      </h4>
                                      <Badge className={record.isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                        {record.isCompleted ? "Completed" : "In Progress"}
                                      </Badge>
                                      <Badge className={record.paymentStatus === "PAID" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                        {record.paymentStatus || "UNPAID"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-xs sm:text-sm text-gray-500">
                                      <span>{formatDate(new Date(record.date))}</span>
                                      <span className="font-medium text-green-600">{formatCurrency(record.cost)}</span>
                                      {record.files && record.files.length > 0 && (
                                        <span>{record.files.length} file{record.files.length !== 1 ? 's' : ''}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Payment Steps */}
                                <div className="mt-4">
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
                              
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecord(record)}
                                  className="text-xs sm:text-sm"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
            <TabsContent value="actions" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Send Message */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Send Message</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {showMessageForm ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message
                          </label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="Enter your message..."
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSendMessage}
                            disabled={isSending || !message.trim()}
                            className="flex-1"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            {isSending ? "Sending..." : "Send"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowMessageForm(false);
                              setMessage("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Send a message to the patient</p>
                        <Button onClick={() => setShowMessageForm(true)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setActiveTab("history");
                          setIsCreatingRecord(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Treatment Record
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Patient Info
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setActiveTab("history")}
                      >
                        <History className="h-4 w-4 mr-2" />
                        View Treatment History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
