"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "./file-upload";

const recordSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  treatmentType: z.string().min(1, "Treatment type is required"),
  description: z.string().min(1, "Description is required"),
  cost: z.number().min(0, "Cost must be positive"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  isCompleted: z.boolean(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface RecordFormProps {
  record?: any;
  onClose: () => void;
  onSuccess: () => void;
  defaultPatientId?: string | null;
}

export function RecordForm({ record, onClose, onSuccess, defaultPatientId }: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recordId, setRecordId] = useState<string | null>(record?.id || null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: record ? {
      patientId: record.patientId || "",
      treatmentType: record.treatmentType || "",
      description: record.description || "",
      cost: record.cost || 0,
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : "",
      notes: record.notes || "",
      isCompleted: record.isCompleted || false,
    } : {
      patientId: defaultPatientId || "",
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      isCompleted: false,
    },
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients?limit=1000"); // Get all patients
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients || []); // Extract patients from pagination response
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        setPatients([]); // Set empty array on error
      }
    };

    fetchPatients();
  }, []);

  const onSubmit = async (data: RecordFormData) => {
    // Prevent duplicate submission if record already exists
    if (!record && recordId) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const url = record ? `/api/records/${record.id}` : "/api/records";
      const method = record ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        if (!record) {
          setRecordId(result.id);
        }
        toast.success(record ? "Record updated successfully" : "Record created successfully");
        if (record) {
          onSuccess();
        } else {
          // For new records, don't call onSuccess immediately - let user upload files first
          // onSuccess will be called when user closes the form
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save record");
      }
    } catch (error) {
      toast.error("An error occurred while saving the record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{record ? "Edit Record" : "Add New Record"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              {defaultPatientId ? (
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50">
                  {patients.find(p => p.id === defaultPatientId) ? (
                    <span className="text-gray-900">
                      {patients.find(p => p.id === defaultPatientId)?.firstName} {patients.find(p => p.id === defaultPatientId)?.lastName}
                    </span>
                  ) : (
                    <span className="text-gray-500">Loading patient...</span>
                  )}
                </div>
              ) : (
                <select
                  {...register("patientId")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              )}
              {errors.patientId && (
                <p className="text-red-500 text-sm mt-1">{errors.patientId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Type *
                </label>
                <select
                  {...register("treatmentType")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select treatment type</option>
                  <option value="CONSULTATION">Consultation</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="FILLING">Filling</option>
                  <option value="EXTRACTION">Extraction</option>
                  <option value="CROWN">Crown</option>
                  <option value="BRIDGE">Bridge</option>
                  <option value="IMPLANT">Implant</option>
                  <option value="ROOT_CANAL">Root Canal</option>
                  <option value="ORTHODONTICS">Orthodontics</option>
                  <option value="COSMETIC">Cosmetic</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.treatmentType && (
                  <p className="text-red-500 text-sm mt-1">{errors.treatmentType.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost *
                </label>
                <Input
                  {...register("cost", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter cost"
                />
                {errors.cost && (
                  <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <Input
                {...register("date")}
                type="date"
                required
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register("description")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter treatment description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register("notes")}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                {...register("isCompleted")}
                type="checkbox"
                id="isCompleted"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isCompleted" className="text-sm font-medium text-gray-700">
                Mark as completed
              </label>
            </div>

            {/* File Upload Section - Show after record is created */}
            {recordId && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attach Files</h3>
                <FileUpload 
                  recordId={recordId} 
                  onFileUploaded={() => {
                    // Optional: refresh or update UI
                  }}
                />
                <div className="mt-4 text-sm text-gray-600">
                  <p>You can attach files to this record. Click "Done" when finished.</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {!record && recordId ? (
                <Button type="button" onClick={onSuccess}>
                  Done
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : record ? "Update Record" : "Create Record"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
