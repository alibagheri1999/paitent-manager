"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RecordForm } from "@/components/records/record-form";
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
  files?: {
    id: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  }[];
}

export default function EditRecordPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;
  
  const [record, setRecord] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/records/${recordId}`);
        if (response.ok) {
          const data = await response.json();
          setRecord(data);
        } else {
          toast.error("Failed to fetch record details.");
          router.push('/records');
        }
      } catch (error) {
        console.error("Error fetching record:", error);
        toast.error("An unexpected error occurred.");
        router.push('/records');
      } finally {
        setIsLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    }
  }, [recordId, router]);

  const handleSuccess = () => {
    router.push(`/records/${recordId}`);
  };

  const handleCancel = () => {
    router.push(`/records/${recordId}`);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Treatment Record</h1>
        <p className="text-gray-600">Update the treatment record for {record.patient.firstName} {record.patient.lastName}</p>
      </div>

      <RecordForm
        isOpen={true}
        record={record}
        onClose={handleCancel}
        onSuccess={handleSuccess}
        defaultPatientId={record.patient.id}
        triggerElement={null}
      />
    </div>
  );
}
