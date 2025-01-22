import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export const Header = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordReset = async () => {
    // Implementation for password reset
    handleLogout();
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" className="h-8" />
          ) : (
            <span className="text-xl font-bold">{settings?.companyName || 'ShamsTV'}</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Button variant="outline" onClick={handlePasswordReset}>
                {language === 'ar' ? 'تغيير كلمة المرور' : 'Reset Password'}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </Button>
        </div>
      </div>
    </header>
  );
};