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

export const generateXml = async (items: NewsItem[], category: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/save-xml', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ 
        items,
        category
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save XML');
    }
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
      // Group items by category
      const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, NewsItem[]>);

      // Generate XML for each category
      for (const [category, categoryItems] of Object.entries(groupedItems)) {
        await generateXml(categoryItems, category);
      }
      
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