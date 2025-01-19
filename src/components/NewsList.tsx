import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { categories, type NewsItem } from "@/types";

export const NewsList = ({ 
  items, 
  onDelete 
}: { 
  items: NewsItem[];
  onDelete: (id: string) => void;
}) => {
  const { language } = useLanguage();
  
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {Object.entries(groupedItems).map(([category, news]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>
              {categories[category as keyof typeof categories][language]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {news.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <span>{item.text}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};