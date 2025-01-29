import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, LogOut, Languages } from "lucide-react";
import { format } from "date-fns";

export const Header = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
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
    localStorage.clear();
    sessionStorage.clear();
    logout();
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
          {settings?.logo ? (
            <div className="flex items-center gap-3">
              <img src={settings.logo} alt={settings?.companyName || 'Logo'} className="h-10" />
              <span className="text-xl font-bold">{settings?.companyName}</span>
            </div>
          ) : (
            <span className="text-xl font-bold">{settings?.companyName || 'ShamsTV'}</span>
          )}
        </Link>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-2xl font-digital">
            {format(currentTime, 'HH:mm:ss')}
          </div>
          <div className="text-sm mt-1">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {user && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            <Languages className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};