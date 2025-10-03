"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, CheckCircle, XCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { translatePaymentMethod } from "@/lib/translate-enums";
import { DateInputWithJalali } from "@/components/ui/date-input-with-jalali";

interface PaymentStep {
  id: string;
  stepNumber: number;
  amount: number;
  dueDate?: string;
  isPaid: boolean;
  paidDate?: string;
  paymentMethod?: string;
  notes?: string;
}

interface PaymentStepsManagerProps {
  recordId: string;
  recordCost: number;
  onUpdate?: () => void;
}

export function PaymentStepsManager({ recordId, recordCost, onUpdate }: PaymentStepsManagerProps) {
  const [paymentSteps, setPaymentSteps] = useState<PaymentStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStep, setEditingStep] = useState<PaymentStep | null>(null);

  useEffect(() => {
    fetchPaymentSteps();
  }, [recordId]);

  const fetchPaymentSteps = async () => {
    try {
      const response = await fetch(`/api/payment-steps?recordId=${recordId}`);
      if (response.ok) {
        const data = await response.json();
        // Convert amount strings to numbers
        const processedData = data.map((step: any) => ({
          ...step,
          amount: typeof step.amount === 'string' ? parseFloat(step.amount) : step.amount
        }));
        setPaymentSteps(processedData);
      }
    } catch (error) {
      console.error("Failed to fetch payment steps:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSteps = async (steps: Omit<PaymentStep, 'id' | 'stepNumber' | 'isPaid' | 'paidDate'>[]) => {
    try {
      const response = await fetch("/api/payment-steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordId,
          steps: steps.map((step, index) => ({
            amount: step.amount,
            dueDate: step.dueDate,
            notes: step.notes,
          })),
        }),
      });

      if (response.ok) {
        toast.success("مراحل پرداخت با موفقیت ایجاد شد");
        setShowAddForm(false);
        fetchPaymentSteps();
        if (onUpdate) onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || "خطا در ایجاد مراحل پرداخت");
      }
    } catch (error) {
      toast.error("خطایی در ایجاد مراحل پرداخت رخ داد");
    }
  };

  const handleUpdateStep = async (stepId: string, isPaid: boolean, paymentMethod?: string, notes?: string) => {
    try {
      const response = await fetch("/api/payment-steps", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stepId,
          isPaid,
          paymentMethod,
          notes,
        }),
      });

      if (response.ok) {
        toast.success(isPaid ? 'مرحله پرداخت به عنوان پرداخت شده علامت‌گذاری شد' : 'مرحله پرداخت به عنوان پرداخت نشده علامت‌گذاری شد');
        setEditingStep(null);
        fetchPaymentSteps();
        if (onUpdate) onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || "خطا در به‌روزرسانی مرحله پرداخت");
      }
    } catch (error) {
      toast.error("خطایی در به‌روزرسانی مرحله پرداخت رخ داد");
    }
  };

  const calculateTotalPaid = () => {
    return paymentSteps.reduce((sum, step) => {
      const amount = typeof step.amount === 'string' ? parseFloat(step.amount) : step.amount;
      return sum + (step.isPaid ? amount : 0);
    }, 0);
  };

  const calculateRemainingDebt = () => {
    const totalPaid = calculateTotalPaid();
    const cost = typeof recordCost === 'string' ? parseFloat(recordCost) : recordCost;
    return cost - totalPaid;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">
            <p className="text-gray-500">در حال بارگذاری مراحل پرداخت...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span>مراحل پرداخت</span>
          </h3>
          {paymentSteps.length === 0 && (
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <span>ایجاد مراحل</span>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 order-3">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 font-semibold">کل هزینه</p>
            <p className="text-sm sm:text-lg font-bold text-gray-900">{formatCurrency(typeof recordCost === 'string' ? parseFloat(recordCost) : recordCost)}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 order-2">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 font-semibold">مبلغ پرداخت شده</p>
            <p className="text-sm sm:text-lg font-bold text-green-600">{formatCurrency(calculateTotalPaid())}</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200 order-1">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 font-semibold">بدهی باقیمانده</p>
            <p className="text-sm sm:text-lg font-bold text-red-600">{formatCurrency(calculateRemainingDebt())}</p>
          </div>
        </div>

        {paymentSteps.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">مراحل پرداختی تعریف نشده است</p>
            <p className="text-sm text-gray-400 mt-1">برای پیگیری اقساط، مراحل پرداخت ایجاد کنید</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentSteps.map((step) => (
              <div key={step.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        step.isPaid ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {step.isPaid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                            مرحله {step.stepNumber.toLocaleString('fa-IR')}: {formatCurrency(typeof step.amount === 'string' ? parseFloat(step.amount) : step.amount)}
                          </h4>
                          <Badge className={step.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {step.isPaid ? "پرداخت شده" : "پرداخت نشده"}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-right">
                          {step.dueDate && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              سررسید: {formatDate(new Date(step.dueDate))}
                            </p>
                          )}
                          {step.isPaid && step.paidDate && (
                            <p className="text-xs sm:text-sm text-green-600">
                              پرداخت شده: {formatDate(new Date(step.paidDate))}
                            </p>
                          )}
                          {step.paymentMethod && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              روش: {translatePaymentMethod(step.paymentMethod)}
                            </p>
                          )}
                          {step.notes && (
                            <p className="text-xs sm:text-sm text-gray-500">{step.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStep(step)}
                      className="flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">ویرایش</span>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Steps Form */}
        {showAddForm && (
          <PaymentStepsForm
            recordCost={recordCost}
            onClose={() => setShowAddForm(false)}
            onSubmit={handleCreateSteps}
          />
        )}

        {/* Edit Step Form */}
        {editingStep && (
          <PaymentStepEditForm
            step={editingStep}
            onClose={() => setEditingStep(null)}
            onSubmit={(isPaid, paymentMethod, notes) => 
              handleUpdateStep(editingStep.id, isPaid, paymentMethod, notes)
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

// Payment Steps Creation Form
function PaymentStepsForm({ 
  recordCost, 
  onClose, 
  onSubmit 
}: { 
  recordCost: number; 
  onClose: () => void; 
  onSubmit: (steps: Omit<PaymentStep, 'id' | 'stepNumber' | 'isPaid' | 'paidDate'>[]) => void;
}) {
  const [steps, setSteps] = useState<{ amount: string; dueDate: string; notes: string }[]>([
    { amount: recordCost.toString(), dueDate: "", notes: "" }
  ]);

  const handleAddStep = () => {
    setSteps([...steps, { amount: "", dueDate: "", notes: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const totalAmount = steps.reduce((sum, step) => sum + parseFloat(step.amount || "0"), 0);
    
    if (Math.abs(totalAmount - recordCost) > 0.01) {
      toast.error(`مجموع مبلغ (${totalAmount.toLocaleString('fa-IR')}) باید برابر با هزینه پرونده (${recordCost.toLocaleString('fa-IR')}) باشد`);
      return;
    }

    onSubmit(steps.map(step => ({
      amount: parseFloat(step.amount),
      dueDate: step.dueDate || undefined,
      notes: step.notes || undefined,
    })));
  };

  return (
    <div className="mt-6 p-6 border-2 border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <h4 className="font-bold text-gray-900 mb-6 text-right text-lg">ایجاد مراحل پرداخت</h4>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 bg-white p-4 rounded-lg shadow-sm">
            {steps.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveStep(index)}
                className="text-red-600 hover:bg-red-50 order-last sm:order-first sm:self-end mb-0 sm:mb-1"
              >
                حذف
              </Button>
            )}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="order-3 sm:order-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1 text-right">یادداشت</label>
                <Input
                  placeholder="یادداشت"
                  value={step.notes}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index].notes = e.target.value;
                    setSteps(newSteps);
                  }}
                  className="text-right"
                />
              </div>
              <div className="order-2 sm:order-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1 text-right">تاریخ سررسید</label>
                <DateInputWithJalali
                  value={step.dueDate}
                  onChange={(date) => {
                    const newSteps = [...steps];
                    newSteps[index].dueDate = date;
                    setSteps(newSteps);
                  }}
                />
              </div>
              <div className="order-1 sm:order-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1 text-right">مبلغ</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="مبلغ"
                  value={step.amount}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index].amount = e.target.value;
                    setSteps(newSteps);
                  }}
                  className="text-right"
                />
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={handleAddStep} className="w-full border-dashed border-2">
          <Plus className="h-4 w-4 ml-2" />
          افزودن مرحله
        </Button>
      </div>
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          لغو
        </Button>
        <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          ایجاد مراحل
        </Button>
      </div>
    </div>
  );
}

// Payment Step Edit Form
function PaymentStepEditForm({ 
  step, 
  onClose, 
  onSubmit 
}: { 
  step: PaymentStep; 
  onClose: () => void; 
  onSubmit: (isPaid: boolean, paymentMethod?: string, notes?: string) => void;
}) {
  const [isPaid, setIsPaid] = useState(step.isPaid);
  const [paymentMethod, setPaymentMethod] = useState(step.paymentMethod || "");
  const [notes, setNotes] = useState(step.notes || "");

  const handleSubmit = () => {
    onSubmit(isPaid, paymentMethod || undefined, notes || undefined);
  };

  return (
    <div className="mt-6 p-6 border-2 border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
      <h4 className="font-bold text-gray-900 mb-6 text-right text-lg">ویرایش مرحله پرداخت</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2 bg-white p-4 rounded-lg">
          <label htmlFor="mark-as-paid" className="text-sm font-semibold text-gray-700">علامت‌گذاری به عنوان پرداخت شده</label>
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="rounded w-5 h-5"
            id="mark-as-paid"
          />
        </div>
        
        {isPaid && (
          <div className="space-y-4 bg-white p-4 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                روش پرداخت
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">انتخاب روش</option>
                <option value="CASH">نقدی</option>
                <option value="CARD">کارت</option>
                <option value="INSURANCE">بیمه</option>
                <option value="CHECK">چک</option>
                <option value="OTHER">سایر</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                یادداشت
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                rows={3}
                placeholder="یادداشت پرداخت"
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          لغو
        </Button>
        <Button onClick={handleSubmit} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          به‌روزرسانی مرحله
        </Button>
      </div>
    </div>
  );
}
