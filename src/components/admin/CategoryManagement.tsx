import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Edit, Trash, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const CategoryManagement = () => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newCategoryData, setNewCategoryData] = useState({
    ar: "",
    en: "",
    mainSceneName: "MAIN_TICKER",
    openerTemplateName: "TICKER_START",
    templateName: "TICKER"
  });
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: categories = {}, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const handleSaveCategory = async (id: string, data: any) => {
    try {
      const response = await fetch(`http://localhost:3000/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم تحديث الفئة" : "Category updated successfully",
        });
        setEditingCategory(null);
        refetch();
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحديث الفئة" : "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم حذف الفئة" : "Category deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حذف الفئة" : "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const CategoryForm = ({ id, initialData }: { id: string; initialData?: any }) => {
    const [formData, setFormData] = useState(initialData || {
      ar: "",
      en: "",
      mainSceneName: "MAIN_TICKER",
      openerTemplateName: "TICKER_START",
      templateName: "TICKER"
    });

    return (
      <div className="space-y-4">
        <Input
          value={formData.ar}
          onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
          placeholder={language === 'ar' ? "الاسم بالعربية" : "Arabic Name"}
        />
        <Input
          value={formData.en}
          onChange={(e) => setFormData({ ...formData, en: e.target.value })}
          placeholder={language === 'ar' ? "الاسم بالإنجليزية" : "English Name"}
        />
        <Input
          value={formData.mainSceneName}
          onChange={(e) => setFormData({ ...formData, mainSceneName: e.target.value })}
          placeholder="Main Scene Name"
        />
        <Input
          value={formData.openerTemplateName}
          onChange={(e) => setFormData({ ...formData, openerTemplateName: e.target.value })}
          placeholder="Opener Template Name"
        />
        <Input
          value={formData.templateName}
          onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
          placeholder="Template Name"
        />
        <div className="flex space-x-2">
          <Button onClick={() => handleSaveCategory(id, formData)}>
            {language === 'ar' ? "حفظ" : "Save"}
          </Button>
          <Button variant="outline" onClick={() => setEditingCategory(null)}>
            {language === 'ar' ? "إلغاء" : "Cancel"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {language === 'ar' ? 'إدارة الفئات' : 'Category Management'}
        </h2>
        <Button onClick={() => setEditingCategory('new')}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
        </Button>
      </div>

      {editingCategory === 'new' && (
        <Card className="p-4">
          <Input
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            placeholder={language === 'ar' ? "معرف الفئة" : "Category ID"}
            className="mb-4"
          />
          <CategoryForm id={newCategoryId} />
        </Card>
      )}

      <div className="space-y-4">
        {Object.entries(categories).map(([id, category]: [string, any]) => (
          <Card key={id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{id}</h3>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'عربي: ' : 'Arabic: '}{category.ar}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'إنجليزي: ' : 'English: '}{category.en}
                </p>
                <p className="text-sm text-gray-600">
                  Main Scene: {category.mainSceneName}
                </p>
                <p className="text-sm text-gray-600">
                  Opener Template: {category.openerTemplateName}
                </p>
                <p className="text-sm text-gray-600">
                  Template: {category.templateName}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setEditingCategory(id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDeleteCategory(id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {editingCategory === id && (
              <div className="mt-4">
                <CategoryForm id={id} initialData={category} />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};