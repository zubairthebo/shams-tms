import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();

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
              onClick={() => {
                // Password reset functionality to be implemented
                console.log('Reset password clicked');
              }}
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