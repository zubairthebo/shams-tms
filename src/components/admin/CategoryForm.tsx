import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CategoryFormProps {
  onSuccess?: () => void;
}

export const CategoryForm = ({ onSuccess }: CategoryFormProps) => {
  const [formData, setFormData] = useState({
    identifier: "",
    ar: "",
    en: "",
    mainSceneName: "",
    openerTemplateName: "",
    templateName: ""
  });

  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`http://localhost:3000/api/categories/${data.identifier}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم إنشاء الفئة" : "Category created successfully",
      });
      setFormData({
        identifier: "",
        ar: "",
        en: "",
        mainSceneName: "",
        openerTemplateName: "",
        templateName: ""
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{language === 'ar' ? 'المعرف' : 'Identifier'}</Label>
        <Input
          value={formData.identifier}
          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>{language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}</Label>
        <Input
          value={formData.ar}
          onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>{language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}</Label>
        <Input
          value={formData.en}
          onChange={(e) => setFormData({ ...formData, en: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>{language === 'ar' ? 'اسم المشهد الرئيسي' : 'Main Scene Name'}</Label>
        <Input
          value={formData.mainSceneName}
          onChange={(e) => setFormData({ ...formData, mainSceneName: e.target.value })}
        />
      </div>
      <div>
        <Label>{language === 'ar' ? 'اسم قالب الافتتاحية' : 'Opener Template Name'}</Label>
        <Input
          value={formData.openerTemplateName}
          onChange={(e) => setFormData({ ...formData, openerTemplateName: e.target.value })}
        />
      </div>
      <div>
        <Label>{language === 'ar' ? 'اسم القالب' : 'Template Name'}</Label>
        <Input
          value={formData.templateName}
          onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full">
        {language === 'ar' ? 'إنشاء' : 'Create'}
      </Button>
    </form>
  );
};