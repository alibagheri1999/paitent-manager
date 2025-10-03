"use client";

import { Input } from "@/components/ui/input";
import { toJalali } from "@/lib/date-utils";
import { Calendar } from "lucide-react";

interface DateInputWithJalaliProps {
  value?: string; // ISO date (YYYY-MM-DD)
  onChange: (value: string) => void; // Returns ISO date
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function DateInputWithJalali({ 
  value, 
  onChange, 
  placeholder = "انتخاب تاریخ",
  required = false,
  className = ""
}: DateInputWithJalaliProps) {
  
  // Convert the ISO date to Jalali for display
  const jalaliShort = value ? toJalali(value, 'jYYYY/jMM/jDD') : '';
  const jalaliLong = value ? toJalali(value, 'jD jMMMM jYYYY') : '';

  return (
    <div className="space-y-2">
      {/* Native English Date Picker */}
      <div className="relative">
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`${className} text-center`}
        />
        <Calendar className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
      
      {/* Show Jalali Date Below */}
      {value && jalaliLong && (
        <div className="flex flex-col items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-900">{jalaliShort}</span>
          </div>
          <span className="text-xs text-blue-700">{jalaliLong}</span>
        </div>
      )}
    </div>
  );
}
