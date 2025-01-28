import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

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

  const socialLinks = [
    { icon: Facebook, url: settings.facebook },
    { icon: Twitter, url: settings.twitter },
    { icon: Instagram, url: settings.instagram },
    { icon: Linkedin, url: settings.linkedin },
    { icon: Youtube, url: settings.youtube }
  ].filter(link => link.url);

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
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};