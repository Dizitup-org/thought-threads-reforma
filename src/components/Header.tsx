import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ShoppingBag, Settings, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Check if user is admin
        const { data: admin } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', session.user.email)
          .single();
        setIsAdmin(!!admin);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Check if user is admin
        const checkAdmin = async () => {
          const { data: admin } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .single();
          setIsAdmin(!!admin);
        };
        checkAdmin();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <motion.header 
        className="fixed top-0 w-full z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/" className="serif-heading text-2xl font-bold text-reforma-brown flex items-center">
                <span className="mr-2">RĒFORMA</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Link
                    to={item.href}
                    className="text-muted-foreground hover:text-reforma-brown transition-colors duration-300 font-medium"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Button asChild variant="ghost" size="icon" className="relative hover:bg-accent/10">
                  <Link to="/cart">
                    <ShoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 bg-reforma-sage text-accent-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </Link>
                </Button>
              </motion.div>
              
              {/* Show profile/login based on user state */}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-reforma-sage text-reforma-brown hover:bg-reforma-sage/10">
                        <User className="h-4 w-4 mr-2" />
                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Profile'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile?tab=orders">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile?tab=settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Button asChild size="sm" className="btn-reforma">
                    <Link to="/auth">
                      Login
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-reforma-brown"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </motion.div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div 
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-card border border-border rounded-lg mt-2 shadow-elegant">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-border pt-2 mt-2 space-y-1">
                  <Link
                    to="/cart"
                    className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart ({totalItems})
                  </Link>
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300 font-semibold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4 mr-2 inline" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 transition-colors duration-300"
                      >
                        <LogOut className="h-4 w-4 mr-2 inline" />
                        Log Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Floating Admin Access Button - Show only for admins after welcome animation */}
      {localStorage.getItem('reforma_welcome_completed') && isAdmin && (
        <motion.div 
          className="fixed bottom-6 right-6 z-40"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Button 
            asChild 
            className="btn-reforma shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <Link to="/admin">
              <Shield className="h-5 w-5 mr-2" />
              Admin Dashboard
            </Link>
          </Button>
        </motion.div>
      )}
    </>
  );
};

export default Header;