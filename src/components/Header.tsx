import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { Clock, LogOut } from "lucide-react";
import { format } from "date-fns";

export const Header = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    // Clear all application storage
    localStorage.clear();
    sessionStorage.clear();
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings?.companyName || 'Logo'} className="h-10" />
          ) : (
            <span className="text-xl font-bold">{settings?.companyName || 'ShamsTV'}</span>
          )}
          <span className="text-lg font-medium hidden md:block">
            {settings?.companyName}
          </span>
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="text-xl font-digital">
            {format(currentTime, 'HH:mm:ss')}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user && (
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'تسجيل خروج' : 'Logout'}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={toggleTheme}
          >
            {theme === 'dark' 
              ? (language === 'ar' ? 'وضع النهار' : 'Light Mode')
              : (language === 'ar' ? 'وضع الليل' : 'Dark Mode')
            }
          </Button>
          <Button
            variant="ghost"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>
      </div>
    </header>
  );
};