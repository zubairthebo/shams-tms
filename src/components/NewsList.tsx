import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NewsItem = {
  id: string;
  text: string;
  category: string;
  timestamp: Date;
};

export const NewsList = ({ items }: { items: NewsItem[] }) => {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NewsItem[]>);

  return (
    <div className="space-y-6 rtl">
      {Object.entries(groupedItems).map(([category, news]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-right">
              {category === "politics" && "سياسة"}
              {category === "sports" && "رياضة"}
              {category === "economy" && "اقتصاد"}
              {category === "technology" && "تكنولوجيا"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {news.map((item) => (
                <li key={item.id} className="text-right p-2 border-b last:border-0">
                  {item.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};