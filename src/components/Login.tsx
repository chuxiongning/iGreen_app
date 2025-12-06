import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { toast } from "sonner@2.0.3";
import logoImage from "figma:asset/e827750074831b7c0b1fd927cc5b318bf0bb80ab.png";
import { api, ApiError } from '../lib/api';
import { saveAuthToken } from '../lib/auth';

interface LoginProps {
  onLogin: (userData: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState("mike.tech");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 调用真实的登录API
      const authData = await api.login(account, password);

      // 保存认证信息到本地存储
      saveAuthToken(authData);

      // 通知父组件登录成功
      onLogin(authData.user);

      // 显示欢迎消息
      toast.success(`Welcome back, ${authData.user.name}!`);
    } catch (err) {
      console.error('Login error:', err);

      if (err instanceof ApiError) {
        // 处理API错误
        if (err.status === 401) {
          setError("Incorrect username or password");
          toast.error("Incorrect username or password");
        } else if (err.status === 500) {
          setError("Server error. Please try again later.");
          toast.error("Server error. Please check if backend is running.");
        } else {
          setError(err.message);
          toast.error(err.message);
        }
      } else {
        // 网络错误或其他错误
        setError("Cannot connect to server. Please check your connection.");
        toast.error("Cannot connect to server. Is the backend running?");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-teal-600 z-0"></div>
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-900/10 p-2">
            <img src={logoImage} alt="iGreen+ Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-teal-900 tracking-tight">iGreen+</h1>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1 pb-2">
            <h2 className="text-2xl font-bold text-center text-slate-900">Sign in to your account</h2>
            <p className="text-sm text-slate-500 text-center">Enter your account and password</p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-start gap-2 text-sm mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="account" 
                    placeholder="Username or Account ID" 
                    type="text" 
                    className="pl-9 focus-visible:ring-teal-600"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-9 focus-visible:ring-teal-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700 h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-slate-50/50 border-t p-6">
            <div className="text-center text-xs text-slate-500">
              <strong>Test Accounts:</strong><br />
              <code className="bg-slate-200 px-2 py-0.5 rounded">mike.tech / password</code> or <code className="bg-slate-200 px-2 py-0.5 rounded">admin / admin123</code>
            </div>
            <div className="text-center text-xs text-slate-500">
              By clicking continue, you agree to our <a href="#" className="underline hover:text-slate-900">Terms of Service</a> and <a href="#" className="underline hover:text-slate-900">Privacy Policy</a>.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
