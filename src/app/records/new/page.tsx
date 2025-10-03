"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { RecordForm } from "@/components/records/record-form";

function NewRecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  const handleSuccess = () => {
    if (patientId) {
      router.push(`/patients/${patientId}/history`);
    } else {
      router.push("/patients");
    }
  };

  const handleClose = () => {
    if (patientId) {
      router.push(`/patients/${patientId}/history`);
    } else {
      router.push("/patients");
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Record</h1>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Record Details</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordForm
            isOpen={true}
            record={null}
            onClose={handleClose}
            onSuccess={handleSuccess}
            defaultPatientId={patientId}
            triggerElement={null}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewRecordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewRecordContent />
    </Suspense>
  );
}
