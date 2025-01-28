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

export const generateXml = async (categoryId: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/save-xml', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ categoryId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save XML');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error saving XML:', error);
    throw error;
  }
};

export const XmlGenerator = ({ items, categoryId }: { items: NewsItem[], categoryId?: string }) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const handleGenerateXml = async () => {
    try {
      if (categoryId) {
        // Generate XML for specific category
        await generateXml(categoryId);
      } else {
        // Generate XML for all user's categories
        const userCategories = user?.assignedCategories || [];
        const categoriesToProcess = user?.role === 'admin' 
          ? Object.keys(categories || {})
          : userCategories;

        await Promise.all(
          categoriesToProcess.map(catId => generateXml(catId))
        );
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