import { NewsForm } from "@/components/NewsForm";
import { NewsList } from "@/components/NewsList";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </Button>
        </div>
        <h1 className={`text-3xl font-bold text-center mb-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          {language === 'ar' ? 'نظام إدارة شريط الأخبار' : 'News Ticker Management System'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <NewsForm />
          </div>
          <div>
            <NewsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;