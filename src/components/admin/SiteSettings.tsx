import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const SiteSettings = () => {
  const [settings, setSettings] = useState({
    companyName: "",
    website: "",
    email: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: ""
  });
  const [logo, setLogo] = useState<File | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: currentSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        companyName: currentSettings.companyName || "",
        website: currentSettings.website || "",
        email: currentSettings.email || "",
        facebook: currentSettings.facebook || "",
        twitter: currentSettings.twitter || "",
        instagram: currentSettings.instagram || "",
        linkedin: currentSettings.linkedin || ""
      });
    }
  }, [currentSettings]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      if (logo) formData.append('logo', logo);
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
        queryClient.invalidateQueries({ queryKey: ['settings'] });
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
          {currentSettings?.logo && (
            <img src={currentSettings.logo} alt="Current logo" className="mt-2 h-12" />
          )}
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
          <Label className="block text-sm font-medium mb-1">
            {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
          </Label>
          <Input
            value={settings.website}
            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">
            {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
          </Label>
          <Input
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Facebook URL</Label>
          <Input
            value={settings.facebook}
            onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Twitter URL</Label>
          <Input
            value={settings.twitter}
            onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Instagram URL</Label>
          <Input
            value={settings.instagram}
            onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">LinkedIn URL</Label>
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