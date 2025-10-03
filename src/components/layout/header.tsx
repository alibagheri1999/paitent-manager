"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 sm:px-6 py-4 shadow-lg animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="relative animate-fade-in">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجوی بیماران، نوبت‌ها..."
              className="pr-10 w-60 sm:w-80 bg-white/50 border-gray-200 focus:bg-white focus:border-blue-300 transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 animate-slide-in-left">
          <Button variant="ghost" size="icon" className="hover:bg-blue-50 transition-all duration-300 hover:scale-110">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {session?.user?.name || "کاربر"}
              </p>
              <p className="text-xs text-gray-500 capitalize group-hover:text-blue-500 transition-colors">
                {session?.user?.role || "کارمند"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
