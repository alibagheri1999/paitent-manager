"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Staff", href: "/staff", icon: UserCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-blue-900 to-blue-800 border-r border-blue-700 shadow-xl">
      <div className="flex h-16 items-center px-6 border-b border-blue-700">
        <div className="flex items-center space-x-2 animate-fade-in">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <Stethoscope className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-xl font-bold text-white">DentalCare</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg animate-slide-in-left",
                isActive
                  ? "bg-white/20 text-white border-r-2 border-white shadow-lg backdrop-blur-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-300",
                isActive ? "text-white animate-pulse" : "text-white/70"
              )} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-blue-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 animate-fade-in animation-delay-1000"
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
