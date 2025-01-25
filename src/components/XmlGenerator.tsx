import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

type NewsItem = {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
};

const fetchCategories = async () => {
  const response = await fetch('http://localhost:3000/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

export const generateXml = async (items: NewsItem[], categories: Record<string, any>) => {
  try {
    // Group items by category identifier
    const groupedItems = items.reduce((acc, item) => {
      // Only process items whose categories exist in our categories list
      if (categories[item.category]) {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
      }
      return acc;
    }, {} as Record<string, NewsItem[]>);

    // Generate XML for each category
    const promises = Object.entries(groupedItems).map(async ([categoryIdentifier, categoryItems]) => {
      console.log('Saving XML for category:', categoryIdentifier);
      
      const response = await fetch('http://localhost:3000/api/save-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          text: categoryItems[categoryItems.length - 1].text,
          categoryId: categoryIdentifier
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

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Filter items based on user's assigned categories
  const filteredItems = items.filter(item => 
    user?.role === 'admin' || 
    (categories && categories[item.category] && user?.assignedCategories.includes(item.category))
  );

  const handleGenerateXml = async () => {
    if (!categories) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "لم يتم تحميل الفئات" 
          : "Categories not loaded",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateXml(filteredItems, categories);
      
      toast({
        title: language === 'ar' ? "تم إنشاء ملفات XML" : "XML Files Created",
        description: language === 'ar' 
          ? `تم حفظ الملفات بنجاح` 
          : `Files saved successfully`,
      });
    } catch (error) {
      console.error('XML generation error:', error);
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