import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Upload, Users, Package, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
// Import the new database test component
import { DatabaseTest } from "@/components/DatabaseTest";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image_file_path?: string;
  collection: string;
  stock: number;
  sizes: string[];
  gsm?: number;
  description?: string;
  featured: boolean;
  tags?: string[];
  discount_percentage?: number;
  discounted_price?: number;
  is_on_sale?: boolean;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    collection: "",
    stock: "",
    sizes: [] as string[],
    gsm: 180,
    description: "",
    featured: false,
    image_url: "",
    image_file_path: "",
    tags: [] as string[],
    discount_percentage: 0
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    emailSignups: 0
  });
  const [saleBanners, setSaleBanners] = useState<any[]>([]);
  const [bannerForm, setBannerForm] = useState({ message: "", is_active: true });
  const { toast } = useToast();

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const availableTags = ["New Arrival", "Winter Collection", "Discount", "Sale", "Limited Edition", "Bestseller"];

  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === "development";

  useEffect(() => {
    if (isAuthenticated) {
      // Check Supabase connection and initialize accordingly
      checkSupabaseConnection().then((isConnected) => {
        if (isConnected) {
          fetchProducts();
          fetchCollections();
          fetchStats();
          fetchSaleBanners();
          
          // Set up real-time subscriptions for all tables with better error handling
          const productsChannel = supabase
            .channel('products-changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'products'
            }, (payload) => {
              console.log('Products changed:', payload);
              fetchProducts();
              fetchStats();
            })
            .subscribe((status) => {
              console.log('Products channel status:', status);
              if (status === 'SUBSCRIBED') {
                console.log('Successfully subscribed to products changes');
              } else if (status === 'CHANNEL_ERROR') {
                console.error('Error subscribing to products changes');
              }
            });

          const bannersChannel = supabase
            .channel('banners-changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'sale_banners'
            }, () => {
              fetchSaleBanners();
            })
            .subscribe();

          const ordersChannel = supabase
            .channel('orders-changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'orders'
            }, () => {
              fetchStats();
            })
            .subscribe();

          const emailsChannel = supabase
            .channel('emails-changes')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'email_signups'
            }, () => {
              fetchStats();
            })
            .subscribe();

          return () => {
            supabase.removeChannel(productsChannel);
            supabase.removeChannel(bannersChannel);
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(emailsChannel);
          };
        } else {
          // Show notification that we're using mock data
          toast({
            title: "Demo Mode",
            description: "Database not available. Using mock data for demonstration.",
          });
        }
      });
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In development mode, allow access with any credentials
    if (isDevelopment) {
      setIsAuthenticated(true);
      toast({
        title: "Development Mode",
        description: "Admin panel unlocked for testing.",
      });
      return;
    }
    
    try {
      // Use Supabase auth for proper authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      
      if (error) {
        throw error;
      }
      
      // Check if user is admin by checking the admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', loginForm.email)
        .single();
      
      if (adminError || !adminUser) {
        // Sign out if not admin
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        return;
      }
      
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to admin panel.",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add a function to initialize with mock data when database is not available
  const initializeWithMockData = () => {
    // Mock data for products
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "SAGE REFLECTION",
        price: 85.00,
        collection: "Core Essentials",
        stock: 12,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        gsm: 180,
        description: "Sophisticated simplicity in muted sage. For minds that seek clarity in complexity.",
        featured: true,
        tags: ["New Arrival"],
        discount_percentage: 0,
        discounted_price: null,
        is_on_sale: false,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
      },
      {
        id: "2",
        name: "EARTH WISDOM",
        price: 90.00,
        collection: "Core Essentials",
        stock: 8,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        gsm: 210,
        description: "Rich brown elegance meets conscious design. Grounded luxury for thoughtful souls.",
        featured: true,
        tags: ["Bestseller"],
        discount_percentage: 15,
        discounted_price: 76.50,
        is_on_sale: true,
        image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop"
      },
      {
        id: "3",
        name: "PURE THOUGHT",
        price: 80.00,
        collection: "Minimalist Series",
        stock: 15,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        gsm: 220,
        description: "Clean cream canvas for profound expression. Where less becomes infinitely more.",
        featured: false,
        tags: ["Winter Collection"],
        discount_percentage: 0,
        discounted_price: null,
        is_on_sale: false,
        image_url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop"
      }
    ];
    
    // Mock collections
    const mockCollections = ["Core Essentials", "Minimalist Series"];
    
    // Mock stats
    const mockStats = {
      totalProducts: 3,
      totalOrders: 0,
      emailSignups: 0
    };
    
    // Mock banners
    const mockBanners = [
      {
        id: "1",
        message: "Flat 20% OFF on Winter Collection",
        is_active: true
      }
    ];
    
    setProducts(mockProducts);
    setCollections(mockCollections);
    setStats(mockStats);
    setSaleBanners(mockBanners);
  };

  // Add a function to check if we can connect to Supabase
  const checkSupabaseConnection = async () => {
    try {
      // Simple test query to check connection
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log("Supabase connection failed:", error.message);
        // Initialize with mock data if connection fails
        initializeWithMockData();
        return false;
      }
      
      console.log("Supabase connection successful");
      // Show notification that we're now using the live database
      toast({
        title: "Connected to Live Database",
        description: "Admin panel is now connected to your Supabase database.",
      });
      return true;
    } catch (error) {
      console.log("Supabase connection error:", error);
      // Initialize with mock data if connection fails
      initializeWithMockData();
      return false;
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error loading products",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Ensure all products have a default GSM value
      const productsWithGsm = (data || []).map(product => ({
        ...product,
        gsm: (product as any).gsm || 180
      }));
      
      setProducts(productsWithGsm);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('name');
      
      if (error) throw error;
      setCollections(data?.map(c => c.name) || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [productsCount, ordersCount, emailsCount] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('email_signups').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalProducts: productsCount.count || 0,
        totalOrders: ordersCount.count || 0,
        emailSignups: emailsCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        collection: productForm.collection,
        stock: parseInt(productForm.stock),
        sizes: productForm.sizes,
        gsm: productForm.gsm,
        description: productForm.description,
        featured: productForm.featured,
        image_url: productForm.image_url,
        image_file_path: productForm.image_file_path,
        tags: productForm.tags,
        discount_percentage: productForm.discount_percentage,
        // Calculate discounted price if there's a discount
        discounted_price: productForm.discount_percentage > 0 
          ? parseFloat(productForm.price) * (1 - productForm.discount_percentage / 100)
          : null,
        is_on_sale: productForm.discount_percentage > 0
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct);
      } else {
        result = await supabase
          .from('products')
          .insert([productData]);
      }

      if (result.error) {
        console.error('Database error:', result.error);
        throw new Error(result.error.message || 'Failed to save product');
      }

      toast({
        title: editingProduct ? "Product updated!" : "Product created!",
        description: "Changes have been saved and synced across all pages.",
      });

      resetForm();
      // Products will auto-refresh via real-time subscription
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error saving product",
        description: error.message || "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const deleteProduct = async (id: string) => {
    // Show confirmation dialog with more details
    const productToDelete = products.find(p => p.id === id);
    if (!productToDelete) {
      toast({
        title: "Product not found",
        description: "Could not find the product to delete.",
        variant: "destructive",
      });
      return;
    }
    
    const confirmed = confirm(`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }
    
    // Set loading state
    setDeletingProductId(id);
    
    try {
      // First, let's check if we have a valid Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if we're in demo mode (no session or using demo credentials)
      const isDemoMode = !session || 
        (loginForm.email === "admin@reforma.com" && loginForm.password === "admin123");
      
      console.log('Delete operation mode:', isDemoMode ? 'Demo' : 'Database');
      console.log('Session available:', !!session);
      
      if (isDemoMode) {
        // Handle mock data scenario
        console.log('Deleting product in demo mode, ID:', id);
        setProducts(prev => {
          const updatedProducts = prev.filter(p => p.id !== id);
          console.log('Products after deletion:', updatedProducts);
          return updatedProducts;
        });
        toast({
          title: "Product deleted",
          description: "Product removed in demo mode.",
        });
        return;
      }
      
      // We're in real database mode - proceed with actual deletion
      console.log('Deleting product from database, ID:', id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete error:', error);
        // If we get a permission error, it might be due to RLS policies
        if (error.message.includes('permission') || error.message.includes('policy')) {
          toast({
            title: "Permission denied",
            description: "You don't have permission to delete products. Please contact your administrator.",
            variant: "destructive",
          });
        } else {
          throw new Error(error.message);
        }
      } else {
        toast({
          title: "Product deleted",
          description: `"${productToDelete.name}" has been removed and synced across all pages.`,
        });
      }

      // Products will auto-refresh via real-time subscription
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error deleting product",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset loading state after a short delay to ensure UI updates properly
      setTimeout(() => {
        setDeletingProductId(null);
      }, 500);
    }
  };

  const editProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      collection: product.collection,
      stock: product.stock.toString(),
      sizes: product.sizes,
      gsm: product.gsm || 180,
      description: product.description || "",
      featured: product.featured,
      image_url: product.image_url || "",
      image_file_path: product.image_file_path || "",
      tags: product.tags || [],
      discount_percentage: product.discount_percentage || 0
    });
    setEditingProduct(product.id);
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      price: "",
      collection: "",
      stock: "",
      sizes: [],
      gsm: 180,
      description: "",
      featured: false,
      image_url: "",
      image_file_path: "",
      tags: [],
      discount_percentage: 0
    });
    setEditingProduct(null);
  };

  const toggleSize = (size: string) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const toggleTag = (tag: string) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const fetchSaleBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('sale_banners')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSaleBanners(data || []);
    } catch (error) {
      console.error('Error fetching sale banners:', error);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we're using mock data (no database connection)
    const isUsingMockData = saleBanners.length > 0 && typeof saleBanners[0].id === 'string' && saleBanners[0].id.length < 10;
    
    if (isUsingMockData) {
      // Handle mock data scenario
      const newBanner = {
        id: (saleBanners.length + 1).toString(),
        message: bannerForm.message,
        is_active: bannerForm.is_active
      };
      
      setSaleBanners(prev => [...prev, newBanner]);
      
      toast({
        title: "Banner created!",
        description: "Sale banner added in demo mode.",
      });

      setBannerForm({ message: "", is_active: true });
      return;
    }
    
    // Original database functionality
    try {
      const { error } = await supabase
        .from('sale_banners')
        .insert([{
          message: bannerForm.message,
          is_active: bannerForm.is_active
        }]);

      if (error) {
        console.error('Banner error:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Banner created!",
        description: "Sale banner has been added and is now live.",
      });

      setBannerForm({ message: "", is_active: true });
      // Banners will auto-refresh via real-time subscription
    } catch (error: any) {
      console.error('Error creating banner:', error);
      toast({
        title: "Error creating banner",
        description: error.message || "Failed to create banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    // Check if we're using mock data (no database connection)
    const isUsingMockData = saleBanners.length > 0 && typeof saleBanners[0].id === 'string' && saleBanners[0].id.length < 10;
    
    if (isUsingMockData) {
      // Handle mock data scenario
      setSaleBanners(prev => 
        prev.map(banner => 
          banner.id === id 
            ? { ...banner, is_active: !currentStatus } 
            : banner
        )
      );
      
      toast({
        title: "Banner updated!",
        description: `Banner is now ${!currentStatus ? 'active' : 'inactive'} in demo mode.`,
      });
      return;
    }
    
    // Original database functionality
    try {
      const { error } = await supabase
        .from('sale_banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) {
        console.error('Toggle banner error:', error);
        throw new Error(error.message);
      }

      toast({
        title: "Banner updated!",
        description: `Banner is now ${!currentStatus ? 'active' : 'inactive'}.`,
      });

      // Banners will auto-refresh via real-time subscription
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast({
        title: "Error updating banner",
        description: error.message || "Failed to update banner.",
        variant: "destructive",
      });
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="serif-heading text-2xl text-elegant">Admin Login</CardTitle>
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
                  Login
                </Button>
              </form>
              {isDevelopment && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Development mode: Any credentials will work
                </p>
              )}
              {!isDevelopment && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Demo credentials: admin@reforma.com / admin123
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your REFORMA collection</p>
        </div>

        {/* Add Database Connection Test */}
        {isAuthenticated && <DatabaseTest />}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="emails">Email List</TabsTrigger>
            <TabsTrigger value="banners">Sale Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Signups</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.emailSignups}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-elegant">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder=""
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder=""
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                          placeholder=""
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gsm">GSM (Grams per Square Meter)</Label>
                        <Select 
                          value={productForm.gsm.toString()} 
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, gsm: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select GSM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="180">180 GSM</SelectItem>
                            <SelectItem value="210">210 GSM</SelectItem>
                            <SelectItem value="220">220 GSM</SelectItem>
                            <SelectItem value="240">240 GSM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                          placeholder=""
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="collection">Collection</Label>
                      <Select 
                        value={productForm.collection} 
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, collection: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select collection" />
                        </SelectTrigger>
                        <SelectContent>
                          {collections.map(collection => (
                            <SelectItem key={collection} value={collection}>
                              {collection}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="image_url">Image URL or Upload</Label>
                      <Input
                        id="image_url"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder=""
                      />
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                // Upload to Supabase Storage
                                const publicUrl = await uploadImageToSupabase(file);
                                setProductForm(prev => ({ 
                                  ...prev, 
                                  image_url: publicUrl,
                                  image_file_path: publicUrl.split('/').pop() || ''
                                }));
                                toast({
                                  title: "Image uploaded successfully",
                                  description: "The image has been uploaded and will be used for this product.",
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Error uploading image",
                                  description: error.message || "Failed to upload image. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                          className="text-sm text-muted-foreground"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload an image file or paste a URL above
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label>Available Sizes</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sizes.map(size => (
                          <Button
                            key={size}
                            type="button"
                            variant={productForm.sizes.includes(size) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleSize(size)}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Product Tags (Funky Badges)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableTags.map(tag => (
                          <Button
                            key={tag}
                            type="button"
                            variant={productForm.tags.includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTag(tag)}
                            className={productForm.tags.includes(tag) ? "bg-primary text-primary-foreground" : ""}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="discount">Discount Percentage (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={productForm.discount_percentage}
                        onChange={(e) => setProductForm(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) || 0 }))}
                        placeholder=""
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Set to 0 for no discount. Discounted price will be calculated automatically.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder=""
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={productForm.featured}
                        onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="btn-elegant flex-1">
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                      {editingProduct && (
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Products List */}
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-elegant">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{product.name}</h4>
                            {product.featured && (
                              <Badge variant="secondary" className="text-xs">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price} • {product.collection} • {product.stock} in stock
                          </p>
                          {product.discount_percentage > 0 && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {product.discount_percentage}% OFF
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                            disabled={deletingProductId === product.id}
                          >
                            {deletingProductId === product.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="serif-heading text-xl text-elegant">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Orders will appear here as customers place them via WhatsApp.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle className="serif-heading text-xl text-elegant">Email Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Newsletter subscribers will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Banner Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-elegant">Create Sale Banner</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBannerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="banner-message">Banner Message</Label>
                      <Input
                        id="banner-message"
                        value={bannerForm.message}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder=""
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="banner-active"
                        checked={bannerForm.is_active}
                        onCheckedChange={(checked) => setBannerForm(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="banner-active">Active Banner</Label>
                    </div>

                    <Button type="submit" className="btn-elegant w-full">
                      Create Banner
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Banners List */}
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-elegant">Active Banners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {saleBanners.map(banner => (
                      <div key={banner.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{banner.message}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {banner.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                        >
                          {banner.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;