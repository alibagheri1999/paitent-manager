"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, FileText } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { PaymentForm } from "./payment-form";

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  notes?: string;
  appointment?: {
    id: string;
    date: string;
    startTime: string;
    treatmentType: string;
  };
  record?: {
    id: string;
    date: string;
    treatmentType: string;
    description: string;
  };
}

interface PaymentListProps {
  appointmentId?: string;
  recordId?: string;
  onRefresh?: () => void;
}

export function PaymentList({ appointmentId, recordId, onRefresh }: PaymentListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [appointmentId, recordId]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (appointmentId) params.append("appointmentId", appointmentId);
      if (recordId) params.append("recordId", recordId);

      const response = await fetch(`/api/payments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    fetchPayments();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getPaymentMethodColor = (method?: string) => {
    switch (method) {
      case "CASH": return "bg-green-100 text-green-800";
      case "CARD": return "bg-blue-100 text-blue-800";
      case "INSURANCE": return "bg-purple-100 text-purple-800";
      case "CHECK": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-gray-500">Loading payments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Payment History</span>
            </h3>
            <Button
              onClick={() => setShowPaymentForm(true)}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Payment</span>
            </Button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payments recorded</p>
              <p className="text-sm text-gray-400 mt-1">Add a payment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </h4>
                            {payment.paymentMethod && (
                              <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                                {payment.paymentMethod}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(new Date(payment.paymentDate))}
                          </p>
                          {payment.notes && (
                            <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {payment.appointment && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Appointment</span>
                        </div>
                      )}
                      {payment.record && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <FileText className="h-4 w-4" />
                          <span>Record</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showPaymentForm && (
        <PaymentForm
          appointmentId={appointmentId}
          recordId={recordId}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
