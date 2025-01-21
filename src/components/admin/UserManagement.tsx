import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { categories } from "@/types";

interface User {
  username: string;
  role: string;
  assignedCategories: string[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUpdateUser = async (username: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم تحديث المستخدم" : "User updated successfully",
        });
        setEditingUser(null);
        setNewPassword("");
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في تحديث المستخدم" : "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
      </h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.username} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{user.username}</h3>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الدور: ' : 'Role: '}{user.role}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الفئات: ' : 'Categories: '}
                  {user.assignedCategories.map(cat => categories[cat]?.[language]).join(', ')}
                </p>
              </div>
              <div className="space-x-2">
                {editingUser === user.username ? (
                  <>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={language === 'ar' ? "كلمة المرور الجديدة" : "New password"}
                      className="mb-2"
                    />
                    <Button onClick={() => handleUpdateUser(user.username)}>
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditingUser(user.username)}>
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};