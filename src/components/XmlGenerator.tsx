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

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <news>
      ${Object.entries(groupedItems)
        .map(
          ([category, news]) => `
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
      `
        )
        .join("")}
    </news>`;

  return xmlContent;
};

export const XmlGenerator = ({ items }: { items: NewsItem[] }) => {
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleGenerateXml = async () => {
    const xmlContent = generateXml(items);
    
    try {
      const response = await fetch('http://localhost:3000/api/save-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xml: xmlContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to save XML');
      }

      const data = await response.json();
      toast({
        title: language === 'ar' ? "تم إنشاء ملف XML" : "XML File Created",
        description: language === 'ar' 
          ? `تم حفظ الملف: ${data.filename}` 
          : `File saved: ${data.filename}`,
      });
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "فشل في حفظ ملف XML" 
          : "Failed to save XML file",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleGenerateXml} className="w-full" variant="secondary">
      {language === 'ar' ? 'توليد ملف XML' : 'Generate XML'}
    </Button>
  );
};