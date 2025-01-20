import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/types";

const AdminPanel = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  if (user?.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          assignedCategories: selectedCategories
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      toast({
        title: language === 'ar' ? "تم بنجاح" : "Success",
        description: language === 'ar' ? "تم إنشاء المستخدم" : "User created successfully",
      });

      setNewUsername("");
      setNewPassword("");
      setSelectedCategories([]);
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إنشاء المستخدم" : "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="container py-8">
      <h1 className={`text-3xl font-bold mb-8 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
      </h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            {language === 'ar' ? 'المستخدمين' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="categories">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'إنشاء مستخدم جديد' : 'Create New User'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                  </label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'الفئات المسموح بها' : 'Assigned Categories'}
                  </label>
                  <div className="space-y-2">
                    {Object.entries(categories).map(([id, labels]) => (
                      <label key={id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(id)}
                          onChange={() => handleCategoryToggle(id)}
                          className="rounded border-gray-300"
                        />
                        <span>{labels[language]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit">
                  {language === 'ar' ? 'إنشاء المستخدم' : 'Create User'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ar' ? 'إدارة الفئات' : 'Category Management'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'إدارة الفئات قيد التطوير' 
                  : 'Category management is under development'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;