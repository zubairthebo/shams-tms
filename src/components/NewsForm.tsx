import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { generateXml } from "./XmlGenerator";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface NewsFormProps {
  onSubmit?: (data: { text: string; category: string }) => void;
}

export const NewsForm = ({ onSubmit }: NewsFormProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");

  const { data: categories = {}, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    retry: 3,
    meta: {
      errorHandler: (error: Error) => {
        console.error('Error fetching categories:', error);
        toast({
          title: language === 'ar' ? "خطأ" : "Error",
          description: language === 'ar' ? "فشل في جلب الفئات" : "Failed to fetch categories",
          variant: "destructive",
        });
      }
    }
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: { text: string; category: string }) => {
      const response = await fetch(`${API_URL}/api/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create news');
      return response.json();
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      // Generate XML only for the affected category
      await generateXml(variables.category);
      setText("");
      setCategory("");
      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تمت إضافة الخبر" : "News item added successfully",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !category) return;
    createNewsMutation.mutate({ text, category });
    if (onSubmit) {
      onSubmit({ text, category });
    }
  };

  const availableCategories = user?.role === 'admin' 
    ? Object.keys(categories)
    : user?.assignedCategories || [];

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">
            {language === 'ar' ? "فشل في تحميل الفئات" : "Failed to load categories"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'ar' ? 'إضافة خبر جديد' : 'Add New News Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder={language === 'ar' ? 'نص الخبر' : 'News text'}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'ar' ? 'اختر الفئة' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categories[cat]?.[language] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            {language === 'ar' ? 'إضافة' : 'Add'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};