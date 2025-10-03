"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Phone, User, Hash } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  nationalId: string;
  email: string;
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient?: Patient | null;
  placeholder?: string;
}

export function PatientSearch({ onPatientSelect, selectedPatient, placeholder = "Search by name, phone, or national ID..." }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/patients?limit=1000"); // Get all patients
        if (response.ok) {
          const data = await response.json();
          setPatients(data.patients || []); // Extract patients from pagination response
        }
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients.slice(0, 10)); // Show first 10 patients by default
      return;
    }

    const filtered = patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const phone = patient.phone?.replace(/\D/g, '') || ''; // Remove non-digits
      const nationalId = patient.nationalId || '';
      const email = patient.email?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      const searchDigits = search.replace(/\D/g, ''); // Remove non-digits for phone/national ID search

      return (
        fullName.includes(search) ||
        (searchDigits && phone.includes(searchDigits)) ||
        (searchDigits && nationalId.includes(searchDigits)) ||
        email.includes(search) ||
        patient.firstName.toLowerCase().includes(search) ||
        patient.lastName.toLowerCase().includes(search)
      );
    });

    setFilteredPatients(filtered.slice(0, 20)); // Limit to 20 results
  }, [searchTerm, patients]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchTerm(`${patient.firstName} ${patient.lastName}`);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onPatientSelect(null!);
    setSearchTerm("");
    setIsOpen(false);
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {selectedPatient && (
          <button
            onClick={clearSelection}
            className="absolute right-3  top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">Loading patients...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              {searchTerm ? "No patients found" : "Start typing to search patients"}
            </div>
          ) : (
            <div className="py-1">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {formatPhone(patient.phone)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {patient.nationalId}
                        </span>
                      </div>
                    </div>
                    {selectedPatient?.id === patient.id && (
                      <div className="text-blue-600">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
