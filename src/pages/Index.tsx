import { useState, useEffect } from "react";
import { NewsForm } from "@/components/NewsForm";
import { NewsList } from "@/components/NewsList";
import { generateXml } from "@/components/XmlGenerator";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NewsItem } from "@/types";

const Index = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const { language, setLanguage } = useLanguage();

  // Load news items from localStorage on component mount
  useEffect(() => {
    const savedNews = localStorage.getItem('newsItems');
    if (savedNews) {
      const parsedNews = JSON.parse(savedNews).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setNewsItems(parsedNews);
    }
  }, []);

  const handleNewsSubmit = (data: { text: string; category: string }) => {
    const newItem: NewsItem = {
      id: crypto.randomUUID(),
      ...data,
      timestamp: new Date(),
    };
    const updatedNews = [...newsItems, newItem];
    setNewsItems(updatedNews);
    // Save to localStorage
    localStorage.setItem('newsItems', JSON.stringify(updatedNews));
    // Generate XML silently
    generateXml(updatedNews);
  };

  const handleDeleteNews = (id: string) => {
    const updatedNews = newsItems.filter(item => item.id !== id);
    setNewsItems(updatedNews);
    // Update localStorage
    localStorage.setItem('newsItems', JSON.stringify(updatedNews));
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