"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PatientList } from "@/components/patients/patient-list";
import { PatientForm } from "@/components/patients/patient-form";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportButton } from "@/components/ui/export-button";
import { Plus, Search, DollarSign } from "lucide-react";
import { DebtReport } from "@/components/debts/debt-report";
import { PatientDebtOverview } from "@/components/debts/patient-debt-overview";

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
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formTriggerElement, setFormTriggerElement] = useState<HTMLElement | null>(null);

  const fetchPatients = async (page: number = currentPage, search: string = searchTerm) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      
      if (search) {
        params.append("search", search);
      }

      console.log('Fetching patients with params:', params.toString());
      const response = await fetch(`/api/patients?${params}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Patients response:', data);
        setPatients(data.patients);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch patients:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePatientCreated = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
    setFormTriggerElement(null);
    fetchPatients(1, searchTerm);
  };

  const handleEditPatient = (patient: Patient, triggerElement?: HTMLElement) => {
    setEditingPatient(patient);
    setFormTriggerElement(triggerElement || null);
    setIsFormOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPatients(page, searchTerm);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatients(1, searchTerm);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Reset to first page when searching
    if (value !== searchTerm) {
      setCurrentPage(1);
      fetchPatients(1, value);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 animate-slide-in-right">بیماران</h1>
            <p className="text-sm sm:text-base text-gray-600 animate-slide-in-right animation-delay-500">مدیریت بیماران کلینیک دندانپزشکی</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-slide-in-left animation-delay-500">
            <ExportButton
              exportType="patients"
              filename="بیماران_خروجی"
              variant="outline"
              className="w-full sm:w-auto hover-lift"
            >
              خروجی اکسل بیماران
            </ExportButton>
            <Button 
              onClick={(e) => {
                setFormTriggerElement(e.currentTarget);
                setIsFormOpen(true);
              }} 
              className="w-full sm:w-auto hover-lift"
            >
              <Plus className="h-4 w-4 ml-2" />
              افزودن بیمار
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-slide-up animation-delay-1000">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="جستجوی بیماران..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10 hover-lift"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full sm:w-auto hover-lift">
            جستجو
          </Button>
        </form>

        {/* Debt Overview Section */}
        <div className="bg-white rounded-lg shadow animate-fade-in animation-delay-1200">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <span>بررسی بدهی بیماران</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">نمای سریع بیماران با پرداخت‌های معوق</p>
          </div>
          <div className="p-4 sm:p-6">
            <PatientDebtOverview />
          </div>
        </div>

        <PatientList 
          patients={patients} 
          onEdit={handleEditPatient}
          onRefresh={() => fetchPatients(currentPage, searchTerm)}
          isLoading={isLoading}
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          totalCount={pagination.totalCount}
          limit={10}
        />

        <PatientForm
          patient={editingPatient}
          isOpen={isFormOpen}
          triggerElement={formTriggerElement}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPatient(null);
            setFormTriggerElement(null);
          }}
          onSuccess={handlePatientCreated}
        />
      </div>
    </DashboardLayout>
  );
}
