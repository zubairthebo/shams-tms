import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Edit, Trash } from "lucide-react";

export const CategoryManagement = () => {
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newCategoryNameAr, setNewCategoryNameAr] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const { data: categories = {}, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/categories');
      return response.json();
    }
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/categories/${newCategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ar: newCategoryNameAr,
          en: newCategoryNameEn
        }),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تمت إضافة الفئة" : "Category added successfully",
        });
        setNewCategoryId("");
        setNewCategoryNameAr("");
        setNewCategoryNameEn("");
        refetch();
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إضافة الفئة" : "Failed to add category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {language === 'ar' ? 'إدارة الفئات' : 'Category Management'}
        </h2>
        <Button onClick={() => setEditingCategory('new')}>
          {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
        </Button>
      </div>

      {editingCategory === 'new' && (
        <Card className="p-4">
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === 'ar' ? 'معرف الفئة' : 'Category ID'}
              </label>
              <Input
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                required
                placeholder="e.g., sports"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === 'ar' ? 'اسم الفئة (عربي)' : 'Category Name (Arabic)'}
              </label>
              <Input
                value={newCategoryNameAr}
                onChange={(e) => setNewCategoryNameAr(e.target.value)}
                required
                placeholder="e.g., رياضة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === 'ar' ? 'اسم الفئة (إنجليزي)' : 'Category Name (English)'}
              </label>
              <Input
                value={newCategoryNameEn}
                onChange={(e) => setNewCategoryNameEn(e.target.value)}
                required
                placeholder="e.g., Sports"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
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
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};