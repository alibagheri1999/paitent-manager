"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, File, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface RecordFile {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadedAt: string;
}

interface FileUploadProps {
  recordId: string;
  onFileUploaded?: () => void;
}

export function FileUpload({ recordId, onFileUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<RecordFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing files
  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/records/${recordId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, [recordId]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    await uploadFile(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/records/${recordId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newFile = await response.json();
        setFiles(prev => [newFile, ...prev]);
        toast.success("فایل با موفقیت آپلود شد");
        onFileUploaded?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "آپلود فایل ناموفق بود");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("آپلود فایل ناموفق بود");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/records/${recordId}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        toast.success("فایل با موفقیت حذف شد");
        onFileUploaded?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "حذف فایل ناموفق بود");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("حذف فایل ناموفق بود");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else {
      return '📎';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-right">در حال بارگذاری فایل‌ها...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              id={`file-upload-${recordId}`}
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600 mb-4">
              <p>برای آپلود کلیک کنید</p>
              <p>تصاویر، PDF، اسناد Word و فایل‌های متنی (حداکثر ۱۰ مگابایت)</p>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              variant="outline"
            >
              {isUploading ? "در حال آپلود..." : "انتخاب فایل"}
            </Button>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-right">فایل‌های آپلود شده</h4>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 order-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                      title="حذف فایل"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(file.fileUrl, '_blank')}
                      title="دانلود فایل"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 order-1">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
