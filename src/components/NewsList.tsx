import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { NewsCategoryGroup } from "./news/NewsCategoryGroup";
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
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const { data: newsItems = [] } = useQuery<NewsItem[]>({
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
        timestamp: new Date(item.timestamp)
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
      if (onEdit) {
        onEdit(editingId, editText);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const canManageCategory = (category: string) => {
    return user?.role === 'admin' || user?.assignedCategories?.includes(category);
  };

  const groupedItems = newsItems.reduce((acc: Record<string, NewsItem[]>, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className={`space-y-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {Object.entries(groupedItems).map(([category, news]) => (
        <NewsCategoryGroup
          key={category}
          categoryName={categories[category]?.[language] || category}
          items={news}
          editingId={editingId}
          editText={editText}
          onEditChange={setEditText}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDelete={(id) => {
            deleteMutation.mutate(id);
            if (onDelete) {
              onDelete(id);
            }
          }}
          canManageCategory={canManageCategory}
          language={language}
        />
      ))}
    </div>
  );
};