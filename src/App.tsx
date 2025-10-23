import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
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
import AdminTest from "./pages/AdminTest";
import ConnectionTest from "./pages/ConnectionTest";
import RLSFix from "./pages/RLSFix";
import StorageTest from "./pages/StorageTest";
import DatabaseTest from "./pages/DatabaseTest";

const queryClient = new QueryClient();

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userData, setUserData] = useState<{ name: string; email: string; phone: string } | null>(null);

  // Check if user has already completed welcome flow
  useEffect(() => {
    const welcomeCompleted = localStorage.getItem('reforma_welcome_completed');
    if (welcomeCompleted) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeComplete = (data: { name: string; email: string; phone: string }) => {
    setUserData(data);
    setShowWelcome(false);
    localStorage.setItem('reforma_welcome_completed', 'true');
    localStorage.setItem('reforma_user_data', JSON.stringify(data));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              {showWelcome && (
                <WelcomeAnimation onComplete={handleWelcomeComplete} />
              )}
              <Header />
              <Routes>
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
            </div>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;