import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingBag, Settings, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [showAdminButton, setShowAdminButton] = useState(true);
  const { totalItems } = useCart();

  // Temporarily bypass auth check
  useEffect(() => {
    // Set mock user for testing
    setUser({ id: "test-user" });
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="serif-heading text-2xl font-bold text-reforma-brown flex items-center">
              <span className="mr-2">RĒFORMA</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-reforma-brown transition-colors duration-300 font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button asChild variant="ghost" size="icon" className="relative hover:bg-accent/10">
                <Link to="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-reforma-sage text-accent-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
              
              <Button asChild variant="ghost" size="icon" className="hover:bg-accent/10">
                <Link to="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              
              {/* Show profile/login based on user state */}
              {user ? (
                <Button asChild variant="outline" size="sm" className="border-reforma-sage text-reforma-brown hover:bg-reforma-sage/10">
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" className="btn-reforma">
                  <Link to="/auth">
                    Login
                  </Link>
                </Button>
              )}
              
              {/* Always show Admin Button for testing */}
              <Button asChild size="sm" className="btn-reforma">
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
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
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
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
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300 font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 mr-2 inline" />
                    Admin Panel
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-3 py-2 text-muted-foreground hover:text-reforma-brown transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Admin Access Button - Always show for testing */}
      <div className="fixed bottom-6 right-6 z-40 animate-fade-in-up">
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
      </div>
    </>
  );
};

export default Header;