"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 px-6 py-4 shadow-lg animate-slide-down">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative animate-fade-in">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients, appointments..."
              className="pl-10 w-80 bg-white/50 border-gray-200 focus:bg-white focus:border-blue-300 transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4 animate-slide-in-right">
          <Button variant="ghost" size="icon" className="hover:bg-blue-50 transition-all duration-300 hover:scale-110">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer group">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize group-hover:text-blue-500 transition-colors">
                {session?.user?.role || "Staff"}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
