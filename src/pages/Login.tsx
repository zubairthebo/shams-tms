import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { language, setLanguage } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: language === 'ar' ? "خطأ" : "Error",
                description: language === 'ar' ? "بيانات الاعتماد غير صالحة" : "Invalid credentials",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="flex justify-end p-4">
                <Button
                    variant="ghost"
                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                >
                    {language === 'ar' ? 'English' : 'عربي'}
                </Button>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-center">
                        {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                            </label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                {language === 'ar' ? 'كلمة المرور' : 'Password'}
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;