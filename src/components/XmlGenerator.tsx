import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

type NewsItem = {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
};

export const generateXml = async (items: NewsItem[], categories: string[]) => {
  try {
    // Group items by category
    const groupedItems = items.reduce((acc, item) => {
      if (categories.includes(item.category) || categories.length === 0) {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
      }
      return acc;
    }, {} as Record<string, NewsItem[]>);

    // Generate XML for each category
    const promises = Object.entries(groupedItems).map(async ([category, categoryItems]) => {
      const response = await fetch('http://localhost:3000/api/save-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          text: categoryItems[categoryItems.length - 1].text,
          categoryId: category
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save XML');
      }
      
      return response.json();
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving XML:', error);
    throw error;
  }
};

export const XmlGenerator = ({ items }: { items: NewsItem[] }) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  // Filter items based on user's assigned categories
  const filteredItems = items.filter(item => 
    user?.role === 'admin' || user?.assignedCategories.includes(item.category)
  );

  const handleGenerateXml = async () => {
    try {
      await generateXml(filteredItems, user?.assignedCategories || []);
      
      toast({
        title: language === 'ar' ? "تم إنشاء ملفات XML" : "XML Files Created",
        description: language === 'ar' 
          ? `تم حفظ الملفات بنجاح` 
          : `Files saved successfully`,
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? `فشل في حفظ الملفات` 
          : `Failed to save files`,
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleGenerateXml} className="w-full" variant="secondary">
      {language === 'ar' ? 'توليد ملفات XML' : 'Generate XML Files'}
    </Button>
  );
};