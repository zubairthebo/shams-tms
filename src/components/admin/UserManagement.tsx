import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Edit, UserPlus } from "lucide-react";

interface User {
  username: string;
  role: string;
  assignedCategories: string[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
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

  const handleAddUser = async (e: React.FormEvent) => {
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
          assignedCategories: []
        }),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تمت إضافة المستخدم" : "User added successfully",
        });
        setNewUsername("");
        setNewPassword("");
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إضافة المستخدم" : "Failed to add user",
        variant: "destructive",
      });
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
        </h2>
        <Button onClick={() => setEditingUser('new')}>
          <UserPlus className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'إضافة مستخدم' : 'Add User'}
        </Button>
      </div>

      {editingUser === 'new' && (
        <Card className="p-4">
          <form onSubmit={handleAddUser} className="space-y-4">
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
            <div className="flex space-x-2">
              <Button type="submit">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.username} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{user.username}</h3>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الدور: ' : 'Role: '}{user.role}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الفئات: ' : 'Categories: '}
                  {user.assignedCategories.join(', ')}
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
                  <Button variant="outline" onClick={() => setEditingUser(user.username)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};