"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PositionedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  triggerElement?: HTMLElement | null;
  title?: React.ReactNode;
  maxWidth?: string;
}

export function PositionedModal({
  isOpen,
  onClose,
  children,
  triggerElement,
  title,
  maxWidth = "600px",
}: PositionedModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !triggerElement || !modalRef.current) return;

    const calculatePosition = () => {
      const triggerRect = triggerElement.getBoundingClientRect();
      const modalRect = modalRef.current?.getBoundingClientRect();
      
      if (!modalRect) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let top = triggerRect.bottom + 10;
      let left = triggerRect.left;

      // تنظیم موقعیت افقی
      if (left + modalRect.width > viewportWidth - 20) {
        left = viewportWidth - modalRect.width - 20;
      }
      
      if (left < 20) {
        left = 20;
      }

      // تنظیم موقعیت عمودی
      if (top + modalRect.height > viewportHeight - 20) {
        top = triggerRect.top - modalRect.height - 10;
      }
      
      if (top < 20) {
        top = 20;
      }

      setPosition({ top, left });
    };

    calculatePosition();
    
    // بازمحاسبه هنگام تغییر سایز صفحه
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [isOpen, triggerElement]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] animate-in fade-in duration-200" />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed z-[9999] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxWidth,
          maxHeight: "85vh",
        }}
      >
        <Card className="shadow-2xl overflow-hidden border-2 border-blue-100">
          {title && (
            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-500 to-blue-600">
              <h3 className="text-xl font-bold text-white flex-1 text-right">{title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 shrink-0 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          <div className="overflow-y-auto max-h-[75vh] bg-white">
            {children}
          </div>
        </Card>
      </div>
    </>
  );

  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}

