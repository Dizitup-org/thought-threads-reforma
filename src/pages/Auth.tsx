import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUser, setIsAdmin, checkSession } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.isAdmin) {
            navigate('/admin');
          } else {
            navigate('/profile');
          }
        }
      } catch (error) {
        console.error("Auth check failed", error);
      }
    };
    checkUser();
    
    // Check if admin login was requested
    const params = new URLSearchParams(location.search);
    if (params.get('admin') === 'true') {
      setIsAdminLogin(true);
      setIsLogin(true);
    }
  }, [navigate, location]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const url = isAdminLogin ? '/api/auth/admin-login' : '/api/auth/login';
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
           const errData = await response.json().catch(() => ({}));
           throw new Error(errData.message || 'Login failed');
        }
        const data = await response.json();
        
        // Update auth context immediately
        setUser({ email, name: data.user?.name || email });
        setIsAdmin(data.isAdmin || false);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        if (data.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      } else {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        
        if (!response.ok) {
           const errData = await response.json().catch(() => ({}));
           throw new Error(errData.message || 'Sign up failed');
        }
        
        toast({
          title: "Account created!",
          description: "You have successfully signed up. You can now log in.",
        });
        
        // Switch to login form
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="serif-heading text-2xl text-reforma-brown">
            {isAdminLogin ? 'Admin Login' : (isLogin ? 'Welcome Back' : 'Join R─ôForma')}
          </CardTitle>
          <CardDescription>
            {isAdminLogin 
              ? 'Access the admin dashboard' 
              : (isLogin 
                ? 'Sign in to your account to continue shopping' 
                : 'Create an account to start your fashion journey')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && !isAdminLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
          
          {!isAdminLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsAdminLogin(!isAdminLogin);
                setIsLogin(true);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isAdminLogin 
                ? "Regular user login" 
                : "Admin login"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
