import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserManagement } from "@/components/admin/UserManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { SiteSettings } from "@/components/admin/SiteSettings";

const AdminPanel = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${language === 'ar' ? 'rtl' : 'ltr'}`}>
          {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
        </h1>
        <Link to="/">
          <Button variant="outline">
            {language === 'ar' ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            {language === 'ar' ? 'المستخدمين' : 'Users'}
          </TabsTrigger>
          <TabsTrigger value="categories">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {language === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardContent className="pt-6">
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <SiteSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;