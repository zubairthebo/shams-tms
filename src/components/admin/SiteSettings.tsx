import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";

export const SiteSettings = () => {
  const [settings, setSettings] = useState({
    companyName: "ShamsTV",
    website: "https://shams.tv",
    email: "zubair@shams.tv",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: ""
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (logo) formData.append('logo', logo);
      if (favicon) formData.append('favicon', favicon);
      formData.append('settings', JSON.stringify(settings));

      const response = await fetch('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم حفظ الإعدادات" : "Settings saved successfully",
        });
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في حفظ الإعدادات" : "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {language === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}
        </h2>
      </div>
      <div className="grid gap-4">
        <div>
          <Label className="block text-sm font-medium mb-1">
            {language === 'ar' ? 'شعار الموقع' : 'Site Logo'}
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">
            {language === 'ar' ? 'أيقونة الموقع' : 'Site Favicon'}
          </Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFavicon(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">
            {language === 'ar' ? 'اسم الشركة' : 'Company Name'}
          </Label>
          <Input
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
          </label>
          <Input
            value={settings.website}
            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <Input
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Facebook</label>
          <Input
            value={settings.facebook}
            onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Twitter</label>
          <Input
            value={settings.twitter}
            onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram</label>
          <Input
            value={settings.instagram}
            onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn</label>
          <Input
            value={settings.linkedin}
            onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
          />
        </div>
        <Button onClick={handleSave}>
          {language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};