import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type NewsItem = {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
};

export const generateXml = (items: NewsItem[]) => {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  // Generate separate XML files for each category
  Object.entries(groupedItems).forEach(async ([category, news]) => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
      <news>
        <category name="${category}">
          ${news
            .map(
              (item) => `
            <item>
              <text>${item.text}</text>
              <timestamp>${item.timestamp.toISOString()}</timestamp>
            </item>
          `
            )
            .join("")}
        </category>
      </news>`;

    try {
      await fetch('http://localhost:3000/api/save-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          xml: xmlContent,
          category,
          filename: `${category}.xml`
        }),
      });
    } catch (error) {
      console.error('Error saving XML:', error);
    }
  });
};

export const XmlGenerator = ({ items }: { items: NewsItem[] }) => {
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleGenerateXml = async () => {
    generateXml(items);
    
    toast({
      title: language === 'ar' ? "تم إنشاء ملفات XML" : "XML Files Created",
      description: language === 'ar' 
        ? `تم حفظ الملفات بنجاح` 
        : `Files saved successfully`,
    });
  };

  return (
    <Button onClick={handleGenerateXml} className="w-full" variant="secondary">
      {language === 'ar' ? 'توليد ملفات XML' : 'Generate XML Files'}
    </Button>
  );
};
