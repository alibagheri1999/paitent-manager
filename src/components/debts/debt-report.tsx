"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, User, Phone, Mail, Calendar, AlertTriangle, CheckCircle, X } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ExportButton } from "@/components/ui/export-button";

interface DebtRecord {
  recordId: string;
  treatmentType: string;
  description: string;
  totalCost: number;
  paymentStatus: string;
  recordDebt: number;
  unpaidSteps: {
    stepNumber: number;
    amount: number;
    dueDate?: string;
    notes?: string;
  }[];
}

interface PatientDebt {
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  totalDebt: number;
  unpaidRecords: number;
  records: DebtRecord[];
}

interface DebtReport {
  totalPatientsWithDebts: number;
  totalDebtAmount: number;
  patients: PatientDebt[];
}

export function DebtReport() {
  const [debtReport, setDebtReport] = useState<DebtReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientDebt | null>(null);
  
  console.log("DebtReport component - selectedPatient:", selectedPatient);

  useEffect(() => {
    fetchDebtReport();
  }, []);

  const fetchDebtReport = async () => {
    try {
      const response = await fetch("/api/debts");
      if (response.ok) {
        const data = await response.json();
        setDebtReport(data);
      }
    } catch (error) {
      console.error("Failed to fetch debt report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNPAID": return "bg-red-100 text-red-800";
      case "PARTIAL": return "bg-yellow-100 text-yellow-800";
      case "PAID": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const exportDebtReport = () => {
    if (!debtReport) return;

    const exportData = debtReport.patients.map(patient => ({
      'Patient Name': patient.patientName,
      'Phone': patient.patientPhone,
      'Email': patient.patientEmail,
      'Total Debt': formatCurrency(patient.totalDebt),
      'Unpaid Records': patient.unpaidRecords,
      'Records': patient.records.map(record => 
        `${record.treatmentType}: ${record.description} (${formatCurrency(record.totalCost)})`
      ).join('; '),
      'Unpaid Steps': patient.records.flatMap(record => 
        record.unpaidSteps.map(step => 
          `Step ${step.stepNumber}: ${formatCurrency(step.amount)}${step.dueDate ? ` (Due: ${formatDate(new Date(step.dueDate))})` : ''}`
        )
      ).join('; ')
    }));

    // Create Excel file
    const workbook = {
      SheetNames: ['Debt Report'],
      Sheets: {
        'Debt Report': {
          '!ref': 'A1:G' + (exportData.length + 1),
          A1: { v: 'Patient Name' },
          B1: { v: 'Phone' },
          C1: { v: 'Email' },
          D1: { v: 'Total Debt' },
          E1: { v: 'Unpaid Records' },
          F1: { v: 'Records' },
          G1: { v: 'Unpaid Steps' },
          ...exportData.reduce((acc, row, index) => {
            const rowNum = index + 2;
            acc[`A${rowNum}`] = { v: row['Patient Name'] };
            acc[`B${rowNum}`] = { v: row['Phone'] };
            acc[`C${rowNum}`] = { v: row['Email'] };
            acc[`D${rowNum}`] = { v: row['Total Debt'] };
            acc[`E${rowNum}`] = { v: row['Unpaid Records'] };
            acc[`F${rowNum}`] = { v: row['Records'] };
            acc[`G${rowNum}`] = { v: row['Unpaid Steps'] };
            return acc;
          }, {} as any)
        }
      }
    };

    // Convert to Excel and download
    const wbout = require('xlsx').write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Loading debt report...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!debtReport || debtReport.patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">No outstanding debts</p>
            <p className="text-sm text-gray-400 mt-1">All patients are up to date with their payments</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Button - Remove this after testing */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <p className="text-sm text-yellow-800 mb-2">Debug: Current selectedPatient state: {selectedPatient ? selectedPatient.patientName : 'null'}</p>
        <Button 
          onClick={() => {
            console.log("Test button clicked");
            if (debtReport && debtReport.patients.length > 0) {
              setSelectedPatient(debtReport.patients[0]);
            }
          }}
          variant="outline"
          size="sm"
        >
          Test Modal (First Patient)
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Patients with Debts</p>
                <p className="text-2xl font-bold text-gray-900">{debtReport.totalPatientsWithDebts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Debt Amount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(debtReport.totalDebtAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Debt</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(debtReport.totalDebtAmount / debtReport.totalPatientsWithDebts)}
                  </p>
                </div>
              </div>
              <Button onClick={exportDebtReport} variant="outline" size="sm">
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Patients with Outstanding Debts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {debtReport.patients.map((patient) => (
              <div key={patient.patientId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{patient.patientName}</h3>
                          <Badge className="bg-red-100 text-red-800">
                            {formatCurrency(patient.totalDebt)} Debt
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{patient.patientPhone}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{patient.patientEmail}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{patient.unpaidRecords} unpaid records</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log("View Details clicked for patient:", patient.patientName);
                        setSelectedPatient(patient);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <>
          {console.log("Rendering modal for patient:", selectedPatient.patientName)}
          <PatientDebtDetails
            patient={selectedPatient}
            onClose={() => {
              console.log("Closing modal for patient:", selectedPatient.patientName);
              setSelectedPatient(null);
            }}
          />
        </>
      )}
    </div>
  );
}

// Patient Debt Details Modal
function PatientDebtDetails({ 
  patient, 
  onClose 
}: { 
  patient: PatientDebt; 
  onClose: () => void;
}) {
  console.log("PatientDebtDetails component rendering for:", patient.patientName);
  
  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{patient.patientName} - Debt Details</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Debt</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(patient.totalDebt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid Records</p>
                <p className="text-xl font-bold text-gray-900">{patient.unpaidRecords}</p>
              </div>
            </div>

            {/* Records */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Outstanding Records</h3>
              <div className="space-y-4">
                {patient.records.map((record) => (
                  <div key={record.recordId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{record.treatmentType}</h4>
                        <p className="text-sm text-gray-600">{record.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">Total: {formatCurrency(record.totalCost)}</p>
                        <p className="font-bold text-red-600">Owed: {formatCurrency(record.recordDebt)}</p>
                        <Badge className={getStatusColor(record.paymentStatus)}>
                          {record.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    
                    {record.unpaidSteps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Unpaid Steps:</p>
                        <div className="space-y-2">
                          {record.unpaidSteps.map((step, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>Step {step.stepNumber}: {formatCurrency(step.amount)}</span>
                              {step.dueDate && (
                                <span className="text-gray-500">
                                  Due: {formatDate(new Date(step.dueDate))}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Use portal to render modal outside the current DOM hierarchy
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return modalContent;
}

function getStatusColor(status: string) {
  switch (status) {
    case "UNPAID": return "bg-red-100 text-red-800";
    case "PARTIAL": return "bg-yellow-100 text-yellow-800";
    case "PAID": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
