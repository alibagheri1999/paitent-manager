"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, User, Mail, Phone, Hash, Calendar, MapPin, AlertTriangle, FileText, Clock, MessageSquare, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

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

interface PatientDetailsModalProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientDetailsModal({ patient, onClose }: PatientDetailsModalProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (!patient.phone) {
      toast.error("Patient phone number not available");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/patients/${patient.id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setMessage("");
        setShowMessageForm(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Patient Details</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Basic Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{patient.firstName} {patient.lastName}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div>
                  <Badge variant={patient.isActive ? "default" : "secondary"}>
                    {patient.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900">
                  {patient.dateOfBirth ? formatDate(new Date(patient.dateOfBirth)) : "Not provided"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">National ID</label>
                <p className="text-gray-900">{patient.nationalId || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </label>
                <p className="text-gray-900">{patient.email || "Not provided"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>Phone</span>
                </label>
                <p className="text-gray-900">{patient.phone || "Not provided"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>Address</span>
                </label>
                <p className="text-gray-900">{patient.address || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {(patient.emergencyContact || patient.emergencyPhone) && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Emergency Contact</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                  <p className="text-gray-900">{patient.emergencyContact || "Not provided"}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Emergency Phone</label>
                  <p className="text-gray-900">{patient.emergencyPhone || "Not provided"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Medical Information</span>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Medical History</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {patient.medicalHistory || "No medical history recorded"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Allergies</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {patient.allergies || "No known allergies"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {patient.notes || "No additional notes"}
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>System Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Created Date</label>
                <p className="text-gray-900">{formatDate(new Date(patient.createdAt))}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{formatDate(new Date(patient.updatedAt))}</p>
              </div>
            </div>
          </div>

          {/* Send Message Section */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Send Message</span>
            </h3>
            
            {patient.phone ? (
              <div className="space-y-3">
                {!showMessageForm ? (
                  <Button 
                    onClick={() => setShowMessageForm(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send SMS Message to Patient
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message to {patient.firstName} {patient.lastName}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        disabled={isSending}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowMessageForm(false);
                          setMessage("");
                        }}
                        disabled={isSending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={isSending || !message.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSending ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-yellow-800 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Phone number not available. Cannot send SMS message.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t mt-6">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => window.open(`/patients/${patient.id}/history`, '_blank')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>View History</span>
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
