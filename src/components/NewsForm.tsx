import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { generateXml } from "@/components/XmlGenerator";

const MAX_CHARS = 75;

export const NewsForm = ({ onSubmit }: { onSubmit: (data: { text: string; category: string }) => void }) => {
    const [text, setText] = useState("");
    const [category, setCategory] = useState("");
    const { toast } = useToast();
    const { language } = useLanguage();
    const { user } = useAuth();

    const { data: categories = {}, refetch: refetchCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await fetch('http://localhost:3000/api/categories');
            return response.json();
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text || !category) {
            toast({
                title: language === 'ar' ? "خطأ" : "Error",
                description: language === 'ar' ? "الرجاء ملء جميع الحقول" : "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        if (user?.role !== 'admin' && !user?.assignedCategories.includes(category)) {
            toast({
                title: language === 'ar' ? "خطأ" : "Error",
                description: language === 'ar' ? "ليس لديك صلاحية لهذه الفئة" : "You don't have permission for this category",
                variant: "destructive",
            });
            return;
        }

        try {
            onSubmit({ text, category });
            setText("");

            const xml = generateXml([{ id: crypto.randomUUID(), text, category, timestamp: new Date() }]);
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/save-xml', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ xml, category }),
            });

            if (!response.ok) {
                throw new Error('Failed to save XML');
            }

            toast({
                title: language === 'ar' ? "تم بنجاح" : "Success",
                description: language === 'ar' ? "تمت إضافة الخبر" : "News item added successfully",
            });
        } catch (error) {
            toast({
                title: language === 'ar' ? "خطأ" : "Error",
                description: language === 'ar' ? "فشل في حفظ الخبر" : "Failed to save news",
                variant: "destructive",
            });
        }
    };

    const availableCategories = user?.role === 'admin' 
        ? categories 
        : Object.entries(categories).reduce((acc, [id, labels]) => {
            if (user?.assignedCategories.includes(id)) {
                acc[id] = labels;
            }
            return acc;
        }, {} as typeof categories);

    const isOverLimit = text.length > MAX_CHARS;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="block text-sm font-medium">
                    {language === 'ar' ? 'نص الخبر' : 'News Text'}
                </label>
                <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="text-right"
                    dir="rtl"
                    placeholder={language === 'ar' ? "أدخل نص الخبر هنا" : "Enter news text here"}
                />
                <div className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-black'}`}>
                    {text.length}/{MAX_CHARS}
                </div>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium">
                    {language === 'ar' ? 'الفئة' : 'Category'}
                </label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                        <SelectValue placeholder={language === 'ar' ? "اختر الفئة" : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(availableCategories).map(([id, labels]) => (
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