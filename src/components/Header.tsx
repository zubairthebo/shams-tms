import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/settings');
      return response.json();
    }
  });

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "كلمات المرور الجديدة غير متطابقة" : "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${user?.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword,
          password: newPassword
        }),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم إعادة تعيين كلمة المرور" : "Password has been reset",
        });
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إعادة تعيين كلمة المرور" : "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  // Don't show language toggle on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <span>{settings?.companyName || 'ShamsTV'} TMS</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user && location.pathname !== '/admin' && user.role === 'admin' && (
            <Link to="/admin">
              <Button variant="secondary">
                {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              </Button>
            </Link>
          )}
          
          {user && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  {language === 'ar' ? 'تغيير كلمة المرور' : 'Reset Password'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'ar' ? 'تغيير كلمة المرور' : 'Reset Password'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder={language === 'ar' ? 'كلمة المرور القديمة' : 'Old Password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder={language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button onClick={handleResetPassword}>
                    {language === 'ar' ? 'حفظ' : 'Save'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="secondary"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </Button>

          {user && (
            <Button
              variant="destructive"
              onClick={logout}
            >
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};