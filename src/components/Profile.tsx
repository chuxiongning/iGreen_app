import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { useLanguage } from './LanguageContext';
import { LogOut, Globe, User, Mail, Phone, Shield, Users, Pencil, Save, X } from 'lucide-react';
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

// Redefine here to avoid importing from App.tsx which might cause cycles
export interface UserProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
  group: string;
  id: string;
}

interface ProfileProps {
  onLogout?: () => void;
  user?: UserProfile;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
}

export function Profile({ onLogout, user, onUpdateProfile }: ProfileProps) {
  const { t, language, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Fallback defaults
  const currentUser = user || {
    name: "Mike Technician",
    // Email removed as per requirement
    phone: "+1 (555) 123-4567",
    group: "Bangkok Operations (Zone A)",
    id: "TECH-8821"
  };

  const handleEdit = () => {
    setFormData({
      name: currentUser.name,
      phone: currentUser.phone
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSave = () => {
    // TODO: Backend Integration - Update Profile
    // Call API to save user profile updates
    // Example: await api.updateUserProfile(user.id, formData);
    
    if (onUpdateProfile) {
      onUpdateProfile(formData);
    }
    setIsEditing(false);
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t.userProfile}</h1>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={handleCancel} className="text-slate-500">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="p-6">
           <div className="flex flex-col items-center text-center">
             <Avatar className="h-24 w-24 mb-4 ring-4 ring-slate-50">
               <AvatarImage src="https://github.com/shadcn.png" />
               <AvatarFallback>MT</AvatarFallback>
             </Avatar>
             
             {isEditing ? (
               <div className="w-full max-w-xs mb-4">
                 <Input 
                   value={formData.name || ""} 
                   onChange={(e) => handleChange('name', e.target.value)}
                   className="text-center font-bold text-lg h-10"
                   placeholder="Your Name"
                 />
               </div>
             ) : (
               <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
             )}
           </div>

           <Separator className="my-6" />

           <div className="space-y-4">
             <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{t.accountInfo}</h3>
             
             {/* Phone */}
             <div className="flex items-center justify-between py-2 min-h-[40px]">
               <div className="flex items-center gap-3 text-slate-700 shrink-0">
                 <Phone className="w-4 h-4 text-slate-400" />
                 <span>{t.phone}</span>
               </div>
               {isEditing ? (
                  <Input 
                   value={formData.phone || ""}
                   onChange={(e) => handleChange('phone', e.target.value)}
                   className="max-w-[220px] h-8 text-right"
                 />
               ) : (
                 <span className="text-sm font-medium text-right truncate ml-4">{currentUser.phone}</span>
               )}
             </div>

             {/* Login Name */}
             <div className="flex items-center justify-between py-2 min-h-[40px]">
               <div className="flex items-center gap-3 text-slate-700">
                 <User className="w-4 h-4 text-slate-400" />
                 <span>Login Name</span>
               </div>
               <span className="text-sm font-medium text-slate-500">{currentUser.username}</span>
             </div>

             {/* Group (Read Only) */}
             <div className="flex items-center justify-between py-2 min-h-[40px]">
               <div className="flex items-center gap-3 text-slate-700">
                 <Users className="w-4 h-4 text-slate-400" />
                 <span>Group</span>
               </div>
               <span className="text-sm font-medium text-slate-500 text-right ml-4">{currentUser.group}</span>
             </div>
           </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t.appSettings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          
          {/* Language Switcher */}
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-medium text-slate-700">{t.language}</span>
            </div>
            {/* TODO: Backend Integration - Language Preference */}
            {/* Persist language selection to user profile/settings */}
            {/* Example: await api.updateUserPreference({ language: 'en' }); */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${language === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${language === 'th' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                onClick={() => setLanguage('th')}
              >
                ไทย
              </button>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Sign Out Button */}
      <Button 
        variant="destructive" 
        className="w-full h-12 gap-2 text-base shadow-lg shadow-red-100"
        onClick={() => {
          // TODO: Backend Integration - Sign Out
          // Call auth API to revoke session
          // Example: await supabase.auth.signOut();
          if (onLogout) onLogout();
        }}
      >
        <LogOut className="w-5 h-5" />
        {t.signOut}
      </Button>

      <div className="text-center text-xs text-slate-400 mt-4">
        VoltTech App {t.version} 2.4.0 (Build 8821)
      </div>
    </div>
  );
}
