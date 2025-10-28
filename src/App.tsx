import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider } from "@/hooks/useWishlist";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Collections from "./pages/Collections";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import WelcomeAnimation from "./components/WelcomeAnimation";
import PremiumWelcomeAnimation from "./components/PremiumWelcomeAnimation";
import AdminTest from "./pages/AdminTest";
import ConnectionTest from "./pages/ConnectionTest";
import RLSFix from "./pages/RLSFix";
import StorageTest from "./pages/StorageTest";
import DatabaseTest from "./pages/DatabaseTest";

const queryClient = new QueryClient();

// Component to handle page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-test" element={<AdminTest />} />
        <Route path="/connection-test" element={<ConnectionTest />} />
        <Route path="/storage-test" element={<StorageTest />} />
        <Route path="/rls-fix" element={<RLSFix />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/database-test" element={<DatabaseTest />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [usePremiumAnimation, setUsePremiumAnimation] = useState(true);
  const [userData, setUserData] = useState<{ name: string; email: string; phone: string } | null>(null);

  // Always show welcome animation on reload
  useEffect(() => {
    const premiumSetting = localStorage.getItem('reforma_premium_welcome');
    
    // Always show welcome animation
    setShowWelcome(true);
    
    if (premiumSetting !== null) {
      setUsePremiumAnimation(premiumSetting === 'true');
    }
  }, []);

  const handleWelcomeComplete = (data?: { name: string; email: string; phone: string }) => {
    if (data) {
      setUserData(data);
      localStorage.setItem('reforma_user_data', JSON.stringify(data));
    }
    setShowWelcome(false);
    // Don't set the completion flag to ensure animation shows on every reload
  };

  const handlePremiumAnimationComplete = () => {
    handleWelcomeComplete();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                {showWelcome && (
                  usePremiumAnimation ? (
                    <PremiumWelcomeAnimation onComplete={handlePremiumAnimationComplete} />
                  ) : (
                    <WelcomeAnimation onComplete={handleWelcomeComplete} />
                  )
                )}
                <Header />
                <AnimatedRoutes />
              </div>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;