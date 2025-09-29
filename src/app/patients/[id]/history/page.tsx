"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Eye, Edit, Trash2, Plus, Download, DollarSign } from "lucide-react";
import { PaymentStepsManager } from "@/components/payments/payment-steps-manager";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface Record {
  id: string;
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
}

interface PatientHistoryPageProps {}

export default function PatientHistoryPage({}: PatientHistoryPageProps) {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchRecords = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const url = new URL(`/api/patients/${patientId}/records`, window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "10");
      if (search) {
        url.searchParams.set("search", search);
      }

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
        setPatient(data.patient);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to fetch patient records");
      }
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to fetch patient records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchRecords(currentPage, searchTerm);
    }
  }, [patientId, currentPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchRecords(1, value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRecords(page, searchTerm);
  };

  const handleDelete = async (recordId: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`/api/records/${recordId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          toast.success("Record deleted successfully");
          fetchRecords(currentPage, searchTerm);
        } else {
          toast.error("Failed to delete record");
        }
      } catch (error) {
        console.error("Failed to delete record:", error);
        toast.error("Failed to delete record");
      }
    }
  };

  const handleExportHistory = async () => {
    try {
      console.log("Exporting patient history for:", patientId);
      const response = await fetch(`/api/export/patient-history/${patientId}`, {
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
        a.download = `patient_history_${patient?.firstName}_${patient?.lastName}_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  if (!patient) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading patient information...</p>
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
              onClick={() => router.push('/patients')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Patients</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName} - Treatment History
              </h1>
              <p className="text-gray-600">
                {patient.email && `${patient.email} • `}
                {patient.phone}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExportHistory}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export History</span>
            </Button>
            <Button
              onClick={() => router.push(`/records/new?patientId=${patientId}`)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Record</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Treatment Records</span>
            <Badge variant="outline">
              {pagination.totalCount} record{pagination.totalCount !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getTreatmentTypeColor(record.treatmentType)}>
                          {record.treatmentType.replace("_", " ")}
                        </Badge>
                        <Badge variant={record.isCompleted ? "default" : "secondary"}>
                          {record.isCompleted ? "Completed" : "Pending"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(new Date(record.date))}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {record.description}
                      </h3>
                      {record.notes && (
                        <p className="text-sm text-gray-600 mb-2">
                          {record.notes}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="font-medium text-green-600">
                          {formatCurrency(record.cost)}
                        </span>
                        <Badge className={getPaymentStatusColor(record.paymentStatus)}>
                          {record.paymentStatus || "UNPAID"}
                        </Badge>
                        <span className="text-gray-500">
                          {record.paymentType || "FULL_PAYMENT"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/records/${record.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/records/${record.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Payment Steps Section */}
                  <div className="mt-4 pt-4 border-t">
                    <PaymentStepsManager
                      recordId={record.id}
                      recordCost={record.cost}
                      onUpdate={fetchRecords}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getPaymentStatusColor(status?: string) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "PARTIAL":
      return "bg-yellow-100 text-yellow-800";
    case "UNPAID":
    default:
      return "bg-red-100 text-red-800";
  }
}

function getTreatmentTypeColor(type: string) {
  const colors: { [key: string]: string } = {
    CLEANING: "bg-blue-100 text-blue-800",
    FILLING: "bg-green-100 text-green-800",
    EXTRACTION: "bg-red-100 text-red-800",
    ROOT_CANAL: "bg-purple-100 text-purple-800",
    CROWN: "bg-yellow-100 text-yellow-800",
    BRIDGE: "bg-indigo-100 text-indigo-800",
    DENTURE: "bg-pink-100 text-pink-800",
    ORTHODONTIC: "bg-teal-100 text-teal-800",
    IMPLANT: "bg-orange-100 text-orange-800",
    OTHER: "bg-gray-100 text-gray-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}
