"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, CheckCircle, XCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";

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
        toast.success("Payment steps created successfully");
        setShowAddForm(false);
        fetchPaymentSteps();
        if (onUpdate) onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create payment steps");
      }
    } catch (error) {
      toast.error("An error occurred while creating payment steps");
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
        toast.success(`Payment step ${isPaid ? 'marked as paid' : 'marked as unpaid'}`);
        setEditingStep(null);
        fetchPaymentSteps();
        if (onUpdate) onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update payment step");
      }
    } catch (error) {
      toast.error("An error occurred while updating payment step");
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
            <p className="text-gray-500">Loading payment steps...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Payment Steps</span>
          </h3>
          {paymentSteps.length === 0 && (
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Steps</span>
            </Button>
          )}
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">Total Cost</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{formatCurrency(typeof recordCost === 'string' ? parseFloat(recordCost) : recordCost)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">Paid Amount</p>
            <p className="text-base sm:text-lg font-semibold text-green-600">{formatCurrency(calculateTotalPaid())}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600">Remaining Debt</p>
            <p className="text-base sm:text-lg font-semibold text-red-600">{formatCurrency(calculateRemainingDebt())}</p>
          </div>
        </div>

        {paymentSteps.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No payment steps defined</p>
            <p className="text-sm text-gray-400 mt-1">Create payment steps to track installments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentSteps.map((step) => (
              <div key={step.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
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
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                            Step {step.stepNumber}: {formatCurrency(typeof step.amount === 'string' ? parseFloat(step.amount) : step.amount)}
                          </h4>
                          <Badge className={step.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {step.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          {step.dueDate && (
                            <p className="text-xs sm:text-sm text-gray-600">
                              Due: {formatDate(new Date(step.dueDate))}
                            </p>
                          )}
                          {step.isPaid && step.paidDate && (
                            <p className="text-xs sm:text-sm text-green-600">
                              Paid: {formatDate(new Date(step.paidDate))}
                            </p>
                          )}
                          {step.paymentMethod && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              Method: {step.paymentMethod}
                            </p>
                          )}
                          {step.notes && (
                            <p className="text-xs sm:text-sm text-gray-500">{step.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStep(step)}
                      className="flex items-center space-x-1 text-xs sm:text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
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
      toast.error(`Total amount (${totalAmount}) must equal record cost (${recordCost})`);
      return;
    }

    onSubmit(steps.map(step => ({
      amount: parseFloat(step.amount),
      dueDate: step.dueDate || undefined,
      notes: step.notes || undefined,
    })));
  };

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium text-gray-900 mb-4">Create Payment Steps</h4>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={step.amount}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].amount = e.target.value;
                  setSteps(newSteps);
                }}
              />
              <Input
                type="date"
                placeholder="Due Date"
                value={step.dueDate}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].dueDate = e.target.value;
                  setSteps(newSteps);
                }}
              />
              <Input
                placeholder="Notes"
                value={step.notes}
                onChange={(e) => {
                  const newSteps = [...steps];
                  newSteps[index].notes = e.target.value;
                  setSteps(newSteps);
                }}
              />
            </div>
            {steps.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveStep(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" onClick={handleAddStep}>
          Add Step
        </Button>
      </div>
      <div className="flex justify-end space-x-4 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Create Steps
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
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium text-gray-900 mb-4">Edit Payment Step</h4>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="rounded"
          />
          <label className="text-sm font-medium text-gray-700">Mark as Paid</label>
        </div>
        
        {isPaid && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select method</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="INSURANCE">Insurance</option>
                <option value="CHECK">Check</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Payment notes"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end space-x-4 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Update Step
        </Button>
      </div>
    </div>
  );
}
