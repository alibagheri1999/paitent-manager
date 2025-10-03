"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, User, Phone, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { translatePaymentStatus, translateTreatmentType } from "@/lib/translate-enums";
import { PositionedModal } from "@/components/ui/positioned-modal";
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
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

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
            <p className="text-gray-500">در حال بارگذاری گزارش بدهی‌ها...</p>
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
            <p className="text-gray-500">بدهی معوقی وجود ندارد</p>
            <p className="text-sm text-gray-400 mt-1">تمام بیماران پرداخت‌های خود را انجام داده‌اند</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">بیماران با بدهی</p>
                <p className="text-2xl font-bold text-gray-900">{debtReport.totalPatientsWithDebts.toLocaleString('fa-IR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">مجموع بدهی</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(debtReport.totalDebtAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">میانگین بدهی</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(debtReport.totalDebtAmount / debtReport.totalPatientsWithDebts)}
                  </p>
                </div>
              </div>
              <Button onClick={exportDebtReport} variant="outline" size="sm">
                خروجی
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>بیماران با بدهی معوق</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {debtReport.patients.map((patient) => (
              <div key={patient.patientId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{patient.patientName}</h3>
                          <Badge className="bg-red-100 text-red-800">
                            بدهی {formatCurrency(patient.totalDebt)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{patient.patientPhone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{patient.patientEmail}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{patient.unpaidRecords.toLocaleString('fa-IR')} پرونده پرداخت نشده</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        setTriggerElement(e.currentTarget);
                        setSelectedPatient(patient);
                      }}
                    >
                      مشاهده جزئیات
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Details Modal */}
      <PositionedModal
        isOpen={!!selectedPatient}
        onClose={() => {
          setSelectedPatient(null);
          setTriggerElement(null);
        }}
        triggerElement={triggerElement}
        title={selectedPatient ? `${selectedPatient.patientName} - جزئیات بدهی` : ""}
        maxWidth="800px"
      >
        {selectedPatient && <PatientDebtDetails patient={selectedPatient} />}
      </PositionedModal>
    </div>
  );
}

// Patient Debt Details Content
function PatientDebtDetails({ patient }: { patient: PatientDebt }) {
  return (
    <div className="p-6 space-y-6">
      {/* Patient Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-600">کل بدهی</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(patient.totalDebt)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">پرونده‌های پرداخت نشده</p>
          <p className="text-xl font-bold text-gray-900">{patient.unpaidRecords.toLocaleString('fa-IR')}</p>
        </div>
      </div>

      {/* Records */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">پرونده‌های معوق</h3>
        <div className="space-y-4">
          {patient.records.map((record) => (
            <div key={record.recordId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{translateTreatmentType(record.treatmentType)}</h4>
                  <p className="text-sm text-gray-600">{record.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">کل: {formatCurrency(record.totalCost)}</p>
                  <p className="font-bold text-red-600">بدهی: {formatCurrency(record.recordDebt)}</p>
                  <Badge className={getStatusColor(record.paymentStatus)}>
                    {translatePaymentStatus(record.paymentStatus)}
                  </Badge>
                </div>
              </div>
              
              {record.unpaidSteps.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">مراحل پرداخت نشده:</p>
                  <div className="space-y-2">
                    {record.unpaidSteps.map((step, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>مرحله {step.stepNumber.toLocaleString('fa-IR')}: {formatCurrency(step.amount)}</span>
                        {step.dueDate && (
                          <span className="text-gray-500">
                            سررسید: {formatDate(new Date(step.dueDate))}
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
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "UNPAID": return "bg-red-100 text-red-800";
    case "PARTIAL": return "bg-yellow-100 text-yellow-800";
    case "PAID": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
