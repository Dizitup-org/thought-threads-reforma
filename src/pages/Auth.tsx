import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, getAdminClient } from '@/integrations/supabase/client';
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

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if admin using admin client to bypass RLS restrictions
        const adminClient = getAdminClient();
        const { data: admin } = adminClient
          ? await adminClient
              .from('admin_users')
              .select('*')
              .eq('email', session.user.email)
              .single()
          : await supabase
              .from('admin_users')
              .select('*')
              .eq('email', session.user.email)
              .single();
        
        if (admin) {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Check if admin user using admin client to bypass RLS restrictions
        const adminClient = getAdminClient();
        const { data: admin } = adminClient
          ? await adminClient
              .from('admin_users')
              .select('*')
              .eq('email', data.user?.email)
              .single()
          : await supabase
              .from('admin_users')
              .select('*')
              .eq('email', data.user?.email)
              .single();
        
        if (isAdminLogin && !admin) {
          // Not an admin user
          await supabase.auth.signOut();
          throw new Error('Admin access required');
        }
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
        if (admin) {
          navigate('/admin');
        } else {
          // Create user profile if it doesn't exist
          const { data: existingProfile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', data.user?.id)
            .single();
          
          if (!existingProfile) {
            await supabase
              .from('users')
              .insert([
                {
                  auth_user_id: data.user?.id,
                  email: data.user?.email,
                  name: data.user?.user_metadata?.full_name || name,
                }
              ]);
          }
          
          navigate('/profile');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
            data: {
              full_name: name,
            }
          }
        });
        
        if (error) throw error;
        
        // Create user profile
        if (data.user) {
          await supabase
            .from('users')
            .insert([
              {
                auth_user_id: data.user.id,
                email: data.user.email,
                name: name,
              }
            ]);
        }
        
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
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