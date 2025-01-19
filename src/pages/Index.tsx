import { useState } from "react";
import { NewsForm } from "@/components/NewsForm";
import { NewsList } from "@/components/NewsList";
import { XmlGenerator } from "@/components/XmlGenerator";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NewsItem } from "@/types";

const Index = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const { language, setLanguage } = useLanguage();

  const handleNewsSubmit = (data: { text: string; category: string }) => {
    const newItem: NewsItem = {
      id: crypto.randomUUID(),
      ...data,
      timestamp: new Date(),
    };
    setNewsItems((prev) => [...prev, newItem]);
    // Trigger XML generation silently
    const xmlGenerator = new XmlGenerator({ items: [...newsItems, newItem] });
    xmlGenerator.generateXml();
  };

  const handleDeleteNews = (id: string) => {
    setNewsItems((prev) => prev.filter(item => item.id !== id));
  };

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
            <NewsForm onSubmit={handleNewsSubmit} />
          </div>
          <div>
            <NewsList items={newsItems} onDelete={handleDeleteNews} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;