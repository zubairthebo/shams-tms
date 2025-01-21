import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className={`text-center ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          <p className="text-gray-600">
            {language === 'ar' 
              ? `© ${currentYear} شمس تي في. جميع الحقوق محفوظة`
              : `© ${currentYear} ShamsTV. All rights reserved`
            }
          </p>
          <div className="text-gray-500 mt-2">
            <p>
              {language === 'ar'
                ? 'للتواصل: zubair@shams.tv'
                : 'Contact: zubair@shams.tv'
              }
            </p>
            <a 
              href="https://shams.tv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.shams.tv
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};