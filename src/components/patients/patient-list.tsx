"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PatientManagementPanel } from "./patient-management-panel";

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

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function PatientList({ patients, onEdit, onRefresh, isLoading }: PatientListProps) {
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  const handleDelete = async (patientId: string) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(`/api/patients/${patientId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          onRefresh();
        }
      } catch (error) {
        console.error("Failed to delete patient:", error);
      }
    }
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No patients found</p>
            </div>
          ) : (
            patients.map((patient) => (
              <div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 text-sm text-gray-500">
                          {patient.email && <span className="truncate">{patient.email}</span>}
                          {patient.phone && <span>{patient.phone}</span>}
                          {patient.nationalId && <span className="hidden sm:inline">ID: {patient.nationalId}</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                          <Badge variant={patient.isActive ? "default" : "secondary"}>
                            {patient.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            Added {formatDate(new Date(patient.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setViewingPatient(patient)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(patient)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(patient.id)}
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

      {viewingPatient && (
        <PatientManagementPanel
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
          onRefresh={onRefresh}
        />
      )}
    </Card>
  );
}
