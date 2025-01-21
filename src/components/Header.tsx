import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${user?.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          password: 'newpassword123' // This should be replaced with a proper password reset flow
        }),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم إعادة تعيين كلمة المرور" : "Password has been reset",
        });
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إعادة تعيين كلمة المرور" : "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center space-x-2">
          <img src="/logo.png" alt="ShamsTV Logo" className="h-8 w-auto" />
          <span>ShamsTV TMS</span>
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
            <Button
              variant="secondary"
              onClick={handleResetPassword}
            >
              {language === 'ar' ? 'تغيير كلمة المرور' : 'Reset Password'}
            </Button>
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