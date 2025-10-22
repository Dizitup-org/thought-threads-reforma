import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    // Check initial auth state
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className="fixed top-0 w-full z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="serif-heading text-2xl md:text-3xl font-bold text-elegant transition-transform duration-300 hover:scale-105"
          >
            REFORMA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  location.pathname === item.href
                    ? "text-primary bg-accent/10"
                    : "text-muted-foreground hover:text-primary hover:bg-accent/5"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button asChild variant="ghost" size="icon" className="relative hover:bg-accent/10 transition-all duration-300 hover:scale-110">
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse-subtle">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            
            <Button asChild variant="ghost" size="icon" className="hover:bg-accent/10 transition-all duration-300 hover:scale-110">
              <Link to="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            
            {user ? (
              <Button asChild variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                <Link to="/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="btn-elegant transition-all duration-300 hover:scale-105">
                <Link to="/auth">
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button asChild variant="ghost" size="icon" className="relative hover:bg-accent/10 transition-all duration-300 hover:scale-110">
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse-subtle">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="transition-all duration-300 hover:scale-110"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-300" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border border-border rounded-lg mt-2 shadow-elegant mb-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                    location.pathname === item.href
                      ? "text-primary bg-accent/10"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <Link
                  to="/cart"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Cart ({totalItems})
                </Link>
                <Link
                  to="/checkout"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Checkout
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Settings
                </Link>
                {user && (
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    Profile
                  </Link>
                )}
                <Link
                  to="/admin"
                  className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;