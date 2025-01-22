import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

export const PasswordReset = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "كلمة المرور الجديدة غير متطابقة" 
          : "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "نجاح" : "Success",
          description: language === 'ar' 
            ? "تم تغيير كلمة المرور بنجاح" 
            : "Password changed successfully"
        });
        logout();
        navigate('/login');
      } else {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "فشل في تغيير كلمة المرور" 
          : "Failed to change password",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">
          {language === 'ar' ? 'تغيير كلمة المرور' : 'Reset Password'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit">
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};