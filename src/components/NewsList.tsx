import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import type { NewsItem } from "@/types";

interface NewsListProps {
  items?: NewsItem[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
}

export const NewsList = ({ items = [], onDelete, onEdit }: NewsListProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const { data: categories = {} } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/categories');
      const data = await response.json();
      return data;
    }
  });

  const { data: newsItems = [] } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/news', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp).toISOString()
      }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:3000/api/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete news');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم حذف الخبر" : "News item deleted successfully",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const response = await fetch(`http://localhost:3000/api/news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text })
      });
      if (!response.ok) throw new Error('Failed to update news');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setEditingId(null);
      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم تحديث الخبر" : "News item updated successfully",
      });
    }
  });

  const handleStartEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, text: editText });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const canManageCategory = (category: string) => {
    return user?.role === 'admin' || user?.assignedCategories?.includes(category);
  };

  const displayItems = items.length > 0 ? items : newsItems;
  const groupedItems = displayItems.reduce((acc: Record<string, NewsItem[]>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {Object.entries(groupedItems).map(([category, news]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>
              {categories[category]?.[language] || category}
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
                        onClick={() => handleSaveEdit()}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelEdit()}
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
                              onClick={() => deleteMutation.mutate(item.id)}
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
