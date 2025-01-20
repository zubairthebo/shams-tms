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
          <p className="text-gray-500 mt-2">
            {language === 'ar'
              ? 'للتواصل: support@shamstv.com'
              : 'Contact: support@shamstv.com'
            }
          </p>
        </div>
      </div>
    </footer>
  );
};