import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const API_URL = 'http://localhost:3000';

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

  useEffect(() => {
    // Check if already logged in via sessionStorage
    const adminData = sessionStorage.getItem('reforma_admin');
    const userData = sessionStorage.getItem('reforma_user');
    if (adminData) { navigate('/admin'); return; }
    if (userData) { navigate('/profile'); return; }

    // Check if admin login was requested via URL param
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
      if (isAdminLogin) {
        // ── Admin login against admin_users table ────────────────────────────
        const res = await fetch(`${API_URL}/api/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Admin login failed');
        }

        sessionStorage.setItem('reforma_admin', JSON.stringify(data.admin));
        toast({ title: 'Welcome, Admin!', description: 'Redirecting to dashboard...' });
        navigate('/admin');

      } else if (isLogin) {
        // ── Regular user login ───────────────────────────────────────────────
        const res = await fetch(`${API_URL}/api/user-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Login failed');
        }

        sessionStorage.setItem('reforma_user', JSON.stringify(data.user));
        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
        navigate('/profile');

      } else {
        // ── Registration ─────────────────────────────────────────────────────
        const res = await fetch(`${API_URL}/api/user-register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        toast({
          title: 'Account created!',
          description: 'You can now sign in with your credentials.',
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during authentication',
        variant: 'destructive',
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
            {isAdminLogin ? 'Admin Login' : (isLogin ? 'Welcome Back' : 'Join RēForma')}
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