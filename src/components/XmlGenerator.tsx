import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type NewsItem = {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
};

export const XmlGenerator = ({ items }: { items: NewsItem[] }) => {
  const { toast } = useToast();

  const generateXml = () => {
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, NewsItem[]>);

    // In a real application, this would be handled by the backend
    // This is just a demonstration of the structure
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

    // In a real application, this would send the XML to the backend
    console.log(xmlContent);
    toast({
      title: "تم إنشاء ملف XML",
      description: "تم إنشاء ملف XML بنجاح",
    });
  };

  return (
    <Button onClick={generateXml} className="w-full" variant="secondary">
      توليد ملف XML
    </Button>
  );
};