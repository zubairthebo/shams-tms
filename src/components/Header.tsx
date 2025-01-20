import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export const Header = () => {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold">
            ShamsTV TMS
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user?.role === 'admin' && (
            <Link to="/admin">
              <Button variant="secondary">
                {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              </Button>
            </Link>
          )}
          <Button
            variant="secondary"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </Button>
        </div>
      </div>
    </header>
  );
};