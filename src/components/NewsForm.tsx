import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const categories = [
  { id: "politics", name: "سياسة" },
  { id: "sports", name: "رياضة" },
  { id: "economy", name: "اقتصاد" },
  { id: "technology", name: "تكنولوجيا" },
];

export const NewsForm = ({ onSubmit }: { onSubmit: (data: { text: string; category: string }) => void }) => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !category) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    onSubmit({ text, category });
    setText("");
    toast({
      title: "تم بنجاح",
      description: "تمت إضافة الخبر",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl">
      <div className="space-y-2">
        <label className="text-right block text-sm font-medium">نص الخبر</label>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="text-right"
          placeholder="أدخل نص الخبر هنا"
        />
      </div>
      <div className="space-y-2">
        <label className="text-right block text-sm font-medium">الفئة</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">إضافة الخبر</Button>
    </form>
  );
};