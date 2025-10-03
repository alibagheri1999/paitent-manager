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
  DollarSign,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "داشبورد", href: "/dashboard", icon: LayoutDashboard },
  { name: "بیماران", href: "/patients", icon: Users },
  { name: "نوبت‌ها", href: "/appointments", icon: Calendar },
  { name: "پرونده‌ها", href: "/records", icon: FileText },
  { name: "بدهی‌ها", href: "/debts", icon: DollarSign },
  { name: "تحلیل و گزارش", href: "/analytics", icon: BarChart3 },
  { name: "کارمندان", href: "/staff", icon: UserCheck },
  { name: "تنظیمات", href: "/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/auth/signin'
      });
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback: redirect anyway
      router.push('/auth/signin');
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-blue-900 to-blue-800 border-r border-blue-700 shadow-xl animate-slide-in-from-left">
      {/* Header with close button for mobile */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-blue-700">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">دندان‌پزشکی</h1>
        </div>
        
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white hover:bg-white/10 hover:scale-110 transition-all duration-300"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-white/15",
                isActive
                  ? "bg-white/20 text-white border-l-2 border-white shadow-lg backdrop-blur-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
              onClick={onClose} // Close sidebar on mobile when navigating
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-500 ease-in-out group-hover:scale-110",
                isActive ? "text-white" : "text-white/70 group-hover:text-white"
              )} />
              <span className="transition-all duration-500 ease-in-out group-hover:-translate-x-1 group-hover:font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-blue-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 transition-all duration-500 ease-in-out hover:scale-105 group"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 ml-3 transition-transform duration-500 ease-in-out group-hover:scale-110" />
          <span className="group-hover:font-semibold">خروج</span>
        </Button>
      </div>
    </div>
  );
}
