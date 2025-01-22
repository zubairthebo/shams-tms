import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface UserFormProps {
  onSubmit: (userData: any) => Promise<void>;
  initialData?: any;
  onCancel: () => void;
  categories: Record<string, { ar: string; en: string }>;
}

export const UserForm = ({ onSubmit, initialData, onCancel, categories }: UserFormProps) => {
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(initialData?.name || "");
  const [designation, setDesignation] = useState(initialData?.designation || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.assignedCategories || []
  );
  const { language } = useLanguage();

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      username,
      password,
      name,
      designation,
      email,
      assignedCategories: selectedCategories,
    });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!initialData && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "ar" ? "اسم المستخدم" : "Username"}
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!initialData}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "ar" ? "كلمة المرور" : "Password"}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!initialData}
              placeholder={initialData ? "Leave blank to keep current password" : ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "ar" ? "الاسم" : "Name"}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "ar" ? "المسمى الوظيفي" : "Designation"}
            </label>
            <Input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "ar" ? "البريد الإلكتروني" : "Email"}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">
            {language === "ar" ? "الفئات المسموح بها" : "Assigned Categories"}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(categories).map(([id, labels]) => (
              <div key={id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${id}`}
                  checked={selectedCategories.includes(id)}
                  onCheckedChange={() => handleCategoryToggle(id)}
                />
                <label
                  htmlFor={`category-${id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {labels[language]}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit">
            {language === "ar" ? "حفظ" : "Save"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
        </div>
      </form>
    </Card>
  );
};