import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NewsForm } from "@/components/NewsForm";
import { NewsList } from "@/components/NewsList";
import { generateXml } from "@/components/XmlGenerator";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import type { NewsItem } from "@/types";

const Dashboard = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    localStorage.setItem('newsItems', JSON.stringify(updatedNews));
    generateXml(updatedNews, user?.assignedCategories || []);
  };

  const handleDeleteNews = (id: string) => {
    const itemToDelete = newsItems.find(item => item.id === id);
    if (!itemToDelete) return;

    if (user?.role !== 'admin' && !user?.assignedCategories.includes(itemToDelete.category)) {
      return;
    }

    const updatedNews = newsItems.filter(item => item.id !== id);
    setNewsItems(updatedNews);
    localStorage.setItem('newsItems', JSON.stringify(updatedNews));
  };

  const handleEditNews = (id: string, newText: string) => {
    const updatedNews = newsItems.map(item => {
      if (item.id === id) {
        return { ...item, text: newText };
      }
      return item;
    });
    setNewsItems(updatedNews);
    localStorage.setItem('newsItems', JSON.stringify(updatedNews));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="outline">
                  {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            >
              {language === 'ar' ? 'English' : 'عربي'}
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>
        <h1 className={`text-3xl font-bold text-center mb-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          {language === 'ar' ? 'نظام إدارة شريط الأخبار' : 'News Ticker Management System'}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <NewsForm onSubmit={handleNewsSubmit} />
          </div>
          <div>
            <NewsList 
              items={newsItems} 
              onDelete={handleDeleteNews} 
              onEdit={handleEditNews}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;