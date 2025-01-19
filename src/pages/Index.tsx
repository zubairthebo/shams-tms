import { useState } from "react";
import { NewsForm } from "@/components/NewsForm";
import { NewsList } from "@/components/NewsList";
import { XmlGenerator } from "@/components/XmlGenerator";

type NewsItem = {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
};

const Index = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  const handleNewsSubmit = (data: { text: string; category: string }) => {
    const newItem: NewsItem = {
      id: crypto.randomUUID(),
      ...data,
      timestamp: new Date(),
    };
    setNewsItems((prev) => [...prev, newItem]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-center mb-8 rtl">نظام إدارة شريط الأخبار</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <NewsForm onSubmit={handleNewsSubmit} />
            <XmlGenerator items={newsItems} />
          </div>
          <div>
            <NewsList items={newsItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;