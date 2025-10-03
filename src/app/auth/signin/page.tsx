"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Eye, EyeOff, Shield, Users, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("ایمیل یا رمز عبور اشتباه است");
      } else {
        const session = await getSession();
        toast.success("خوش آمدید! در حال انتقال به داشبورد...");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("خطایی رخ داد");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 animate-float">
          <Shield className="w-8 h-8 text-white/20" />
        </div>
        <div className="absolute top-32 right-32 animate-float animation-delay-1000">
          <Users className="w-6 h-6 text-white/20" />
        </div>
        <div className="absolute bottom-32 left-32 animate-float animation-delay-2000">
          <Calendar className="w-7 h-7 text-white/20" />
        </div>
        <div className="absolute bottom-20 right-20 animate-float animation-delay-3000">
          <TrendingUp className="w-6 h-6 text-white/20" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Animation */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full mb-4 animate-pulse">
              <Stethoscope className="h-10 w-10 text-white animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
              دندان‌پزشکی
            </h1>
            <p className="text-blue-200 text-lg animate-fade-in animation-delay-500">
              مدیریت حرفه‌ای کلینیک
            </p>
          </div>

          {/* Login Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-slide-up">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white">
                خوش آمدید
              </CardTitle>
              <CardDescription className="text-blue-200">
                برای دسترسی به سیستم مدیریت کلینیک دندانپزشکی وارد شوید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    آدرس ایمیل
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ایمیل خود را وارد کنید"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    رمز عبور
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="رمز عبور خود را وارد کنید"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-300 pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 active:scale-95" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>در حال ورود...</span>
                    </div>
                  ) : (
                    "ورود به سیستم"
                  )}
                </Button>
              </form>
              
              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-white/10 rounded-lg border border-white/20">
                <h3 className="text-sm font-semibold text-white mb-3 text-center">
                  اطلاعات آزمایشی
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center text-white/80">
                    <span>مدیر:</span>
                    <span className="font-mono">admin@dentalclinic.com</span>
                  </div>
                  <div className="flex justify-between items-center text-white/80">
                    <span>دکتر:</span>
                    <span className="font-mono">doctor@dentalclinic.com</span>
                  </div>
                  <div className="flex justify-between items-center text-white/80">
                    <span>رمز عبور:</span>
                    <span className="font-mono">admin123</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 animate-fade-in animation-delay-1000">
              <Users className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-xs text-white/80">مدیریت بیماران</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 animate-fade-in animation-delay-1500">
              <Calendar className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-xs text-white/80">نوبت‌دهی</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 animate-fade-in animation-delay-2000">
              <TrendingUp className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-xs text-white/80">گزارش‌گیری</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
