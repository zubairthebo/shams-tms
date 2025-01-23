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

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings?.companyName || 'Logo'} className="h-8" />
          ) : (
            <span className="text-xl font-bold">{settings?.companyName || 'ShamsTV'}</span>
          )}
          <span className="text-lg font-medium hidden md:block">
            {settings?.companyName}
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          {user && (
            <>
              <Button variant="ghost" size="icon" onClick={handlePasswordReset}>
                <Key className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
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