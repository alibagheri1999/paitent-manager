"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  exportType: 'appointments' | 'records' | 'patients' | 'analytics';
  filename: string;
  searchParams?: Record<string, string>;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function ExportButton({ 
  exportType, 
  filename, 
  searchParams = {}, 
  variant = "outline",
  size = "default",
  className = "",
  children 
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Build query string
      const params = new URLSearchParams(searchParams);
      const queryString = params.toString();
      const url = `/api/export/${exportType}${queryString ? `?${queryString}` : ''}`;

      console.log("Exporting to URL:", url);

      // Fetch the Excel file with credentials
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Export failed:", errorText);
        throw new Error(`Export failed: ${response.status} ${errorText}`);
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${filename}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${exportType}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {children || `Export ${exportType.charAt(0).toUpperCase() + exportType.slice(1)}`}
    </Button>
  );
}
