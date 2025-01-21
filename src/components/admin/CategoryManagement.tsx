import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const CategoryManagement = () => {
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newCategoryNameAr, setNewCategoryNameAr] = useState("");
  const [newCategoryNameEn, setNewCategoryNameEn] = useState("");
  const { toast } = useToast();
  const { language } = useLanguage();

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
      <h2 className="text-xl font-bold">
        {language === 'ar' ? 'إدارة الفئات' : 'Category Management'}
      </h2>
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
        <Button type="submit">
          {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
        </Button>
      </form>
    </div>
  );
};