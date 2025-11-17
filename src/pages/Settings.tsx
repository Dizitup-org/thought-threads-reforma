import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  site_title: string;
  tagline: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
}

const Settings = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: "RēForma",
    tagline: "Fashion. Reimagined.",
    about_text: "Minimalist elegance for deep thinkers. Where sophisticated design meets conscious choices.",
    contact_email: "hello@reforma.com",
    contact_phone: "+1 (555) 123-4567",
    whatsapp_number: "6289702019",
    instagram_url: "https://instagram.com/reforma",
    facebook_url: "https://facebook.com/reforma"
  });
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, use simple authentication
    if (loginForm.email === "admin@reforma.com" && loginForm.password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to settings panel.",
      });
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // For now, just save to localStorage. Later can be connected to Supabase
      localStorage.setItem('reforma_settings', JSON.stringify(settings));
      
      toast({
        title: "Settings saved!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('reforma_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="serif-heading text-2xl text-elegant">Settings Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@reforma.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-elegant">
                  Access Settings
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Demo credentials: admin@reforma.com / admin123
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-2">Site Settings</h1>
          <p className="text-muted-foreground">Manage your site content and contact information</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="serif-heading text-2xl text-elegant">General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.tagline}
                    onChange={(e) => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="about_text">About Text</Label>
                <Textarea
                  id="about_text"
                  value={settings.about_text}
                  onChange={(e) => setSettings(prev => ({ ...prev, about_text: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp_number">WhatsApp Number (for orders)</Label>
                <Input
                  id="whatsapp_number"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                  placeholder="1234567890"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the phone number without + or spaces (e.g., 1234567890)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    value={settings.instagram_url}
                    onChange={(e) => setSettings(prev => ({ ...prev, instagram_url: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input
                    id="facebook_url"
                    value={settings.facebook_url}
                    onChange={(e) => setSettings(prev => ({ ...prev, facebook_url: e.target.value }))}
                  />
                </div>
              </div>

              <Button type="submit" className="btn-elegant">
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;