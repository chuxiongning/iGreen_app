import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { toast } from "sonner@2.0.3";
import logoImage from "figma:asset/e827750074831b7c0b1fd927cc5b318bf0bb80ab.png";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState("mike.tech");
  const [password, setPassword] = useState("password");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Backend Integration - Sign In
    // Implement authentication logic here
    // Example:
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: account + "@igreenplus.com", // transform account to email if needed internally
    //   password,
    // });
    
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      if (account && password) {
        onLogin();
        toast.success("Welcome back, Mike!");
      } else {
        toast.error("Please enter valid credentials");
      }
    }, 1500);
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
              By clicking continue, you agree to our <a href="#" className="underline hover:text-slate-900">Terms of Service</a> and <a href="#" className="underline hover:text-slate-900">Privacy Policy</a>.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
