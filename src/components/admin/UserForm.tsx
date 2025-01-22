import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === "ar" ? "الفئات المسموح بها" : "Assigned Categories"}
          </label>
          <Select
            value={selectedCategories.join(",")}
            onValueChange={(value) => setSelectedCategories(value.split(","))}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  language === "ar" ? "اختر الفئات" : "Select categories"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categories).map(([id, labels]: [string, any]) => (
                <SelectItem key={id} value={id}>
                  {labels[language]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
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