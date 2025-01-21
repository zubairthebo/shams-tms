import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

export const Footer = () => {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/settings');
      return response.json();
    },
    initialData: {
      companyName: 'ShamsTV',
      website: 'https://shams.tv',
      email: 'zubair@shams.tv',
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  if (isLoading || !settings) {
    return (
      <footer className="bg-gray-100 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className={`text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          <p className="text-gray-600">
            {language === 'ar' 
              ? `© ${currentYear} ${settings.companyName}. جميع الحقوق محفوظة`
              : `© ${currentYear} ${settings.companyName}. All rights reserved`
            }
          </p>
          <div className="text-gray-500 mt-2">
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
              className="text-primary hover:underline"
            >
              {settings.website}
            </a>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                Facebook
              </a>
            )}
            {settings.twitter && (
              <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                Twitter
              </a>
            )}
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                Instagram
              </a>
            )}
            {settings.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};