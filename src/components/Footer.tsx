import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  if (!settings) {
    return null;
  }

  return (
    <footer className="bg-primary text-primary-foreground py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className={`text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          <p className="text-lg font-medium mb-2">
            {settings.companyName}
          </p>
          <p className="text-sm opacity-80">
            {language === 'ar' 
              ? `© ${currentYear} ${settings.companyName}. جميع الحقوق محفوظة`
              : `© ${currentYear} ${settings.companyName}. All rights reserved`
            }
          </p>
          <div className="text-sm opacity-80 mt-2">
            <p>
              {language === 'ar'
                ? `للتواصل: ${settings.email}`
                : `Contact: ${settings.email}`
              }
            </p>
            <a 
              href={settings.website}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {settings.website}
            </a>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {settings.facebook && (
              <a 
                href={settings.facebook} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-secondary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {settings.twitter && (
              <a 
                href={settings.twitter} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-secondary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {settings.instagram && (
              <a 
                href={settings.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-secondary transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings.linkedin && (
              <a 
                href={settings.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-secondary transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};