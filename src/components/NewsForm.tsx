import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { categories } from "@/types";

export const NewsForm = ({ onSubmit }: { onSubmit: (data: { text: string; category: string }) => void }) => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !category) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "الرجاء ملء جميع الحقول" : "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    onSubmit({ text, category });
    setText("");
    toast({
      title: language === 'ar' ? "تم بنجاح" : "Success",
      description: language === 'ar' ? "تمت إضافة الخبر" : "News item added successfully",
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {language === 'ar' ? 'نص الخبر' : 'News Text'}
        </label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={language === 'ar' ? 'text-right' : 'text-left'}
          placeholder={language === 'ar' ? "أدخل نص الخبر هنا" : "Enter news text here"}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {language === 'ar' ? 'الفئة' : 'Category'}
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder={language === 'ar' ? "اختر الفئة" : "Select category"} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categories).map(([id, labels]) => (
              <SelectItem key={id} value={id}>
                {labels[language]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        {language === 'ar' ? 'إضافة الخبر' : 'Add News'}
      </Button>
    </form>
  );
};