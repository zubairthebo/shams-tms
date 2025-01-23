import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sun, Moon, Languages, LogOut, Key } from "lucide-react";
import { useTheme } from "next-themes";

export const Header = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  const handlePasswordReset = () => {
    navigate('/reset-password');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    // Force theme update
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
        <div className="flex items-center space-x-3">
          {user && (
            <>
              <Button variant="ghost" size="icon" onClick={handlePasswordReset} className="p-2">
                <Key className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} className="p-2">
                <LogOut className="h-6 w-6" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6" />
            ) : (
              <Moon className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-2"
          >
            <Languages className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};