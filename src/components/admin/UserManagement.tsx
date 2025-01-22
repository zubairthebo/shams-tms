import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { UserPlus, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserForm } from "./UserForm";

interface User {
  username: string;
  role: string;
  name: string;
  designation: string;
  email: string;
  assignedCategories: string[];
}

export const UserManagement = () => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    }
  });

  const { data: categories = {} } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const handleAddUser = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تمت إضافة المستخدم" : "User added successfully",
        });
        setEditingUser(null);
        refetchUsers();
      }
    } catch (error) {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' ? "فشل في إضافة المستخدم" : "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (username: string, userData: any) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast({
          title: language === 'ar' ? "تم بنجاح" : "Success",
          description: language === 'ar' ? "تم تحديث المستخدم" : "User updated successfully",
        });
        setEditingUser(null);
        refetchUsers();
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
        <UserForm
          onSubmit={handleAddUser}
          onCancel={() => setEditingUser(null)}
          categories={categories}
        />
      )}

      <div className="space-y-4">
        {users.map((user: User) => (
          <Card key={user.username} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.username}</p>
                <p className="text-sm text-gray-600">{user.designation}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الدور: ' : 'Role: '}{user.role}
                </p>
                <p className="text-sm text-gray-600">
                  {language === 'ar' ? 'الفئات: ' : 'Categories: '}
                  {user.assignedCategories.map(cat => categories[cat]?.[language]).join(', ')}
                </p>
              </div>
              <div>
                {editingUser === user.username ? (
                  <UserForm
                    initialData={user}
                    onSubmit={(userData) => handleUpdateUser(user.username, userData)}
                    onCancel={() => setEditingUser(null)}
                    categories={categories}
                  />
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