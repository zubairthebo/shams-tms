import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { categories, type NewsItem } from "@/types";

export const NewsList = ({ 
  items, 
  onDelete,
  onEdit
}: { 
  items: NewsItem[];
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  const handleStartEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      onEdit(editingId, editText);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const canManageCategory = (category: string) => {
    return user?.role === 'admin' || user?.assignedCategories.includes(category);
  };

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
                  {editingId === item.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveEdit}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span>{item.text}</span>
                      <div className="flex items-center space-x-2">
                        {canManageCategory(item.category) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStartEdit(item)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};