import { useState, useEffect, useRef } from "react";
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
import { Plus, Edit, Trash2, Upload, Users, Package, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, getAdminClient } from "@/integrations/supabase/client";

// Use a flexible type that can handle both old and new data structures
interface Product {
  id: string;
  [key: string]: any; // Allow any additional properties
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [productForm, setProductForm] = useState({
    product_name: "",
    price: "",
    collection: "",
    stock: "",
    sizes: [] as string[],
    gsm_options: [] as number[],
    description: "",
    featured: false,
    tags: [] as string[],
    discount_percentage: 0,
    images: [] as string[]
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
  const [dbHealth, setDbHealth] = useState<{status: string, message: string}>({status: 'checking', message: 'Checking database connection...'});
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [setupForm, setSetupForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [emailSignups, setEmailSignups] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const gsmOptions = [180, 210, 220, 240];
  const availableTags = ["New Arrival", "Winter Collection", "Discount", "Sale", "Limited Edition", "Bestseller"];

  // Database health check
  const checkDatabaseHealth = async () => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      if (error) {
        setDbHealth({status: 'error', message: `Database error: ${error.message}`});
        return false;
      }
      
      // Test storage connection
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      if (storageError) {
        setDbHealth({status: 'error', message: `Storage error: ${storageError.message}`});
        return false;
      }
      
      setDbHealth({status: 'healthy', message: 'Database and storage connected successfully'});
      return true;
    } catch (error: any) {
      setDbHealth({status: 'error', message: `Connection failed: ${error.message}`});
      return false;
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // For demo purposes, use simple authentication
      // In a real application, this would be replaced with proper Supabase auth
      if (loginForm.email === "admin@reforma.com" && loginForm.password === "admin123") {
        setIsAuthenticated(true);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to admin panel.",
        });
      } else {
        // Try to authenticate with Supabase
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', loginForm.email)
          .single();
        
        if (error || !data) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password.",
            variant: "destructive",
          });
          return;
        }
        
        // In a real app, you would verify the password hash
        // For now, we'll just check if the user exists
        setIsAuthenticated(true);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to admin panel.",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to login. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Temporarily bypass auth check for development
  useEffect(() => {
    // For development, auto-login with demo credentials
    // In production, remove this and use proper authentication
    setIsAuthenticated(true);
    
    checkDatabaseHealth();
    fetchProducts();
    fetchCollections();
    fetchStats();
    fetchSaleBanners();
    fetchOrders();
    fetchEmailSignups();
    
    // Set up real-time subscriptions for all tables
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('Admin: Real-time product change detected:', payload);
        fetchProducts();
        fetchStats();
      })
      .subscribe((status) => {
        console.log('Admin: Products channel status:', status);
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
        fetchOrders();
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
        fetchEmailSignups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(bannersChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(emailsChannel);
    };
  }, []);

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
      // Type assertion to handle flexible data structure
      setProducts(data as Product[] || []);
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

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchEmailSignups = async () => {
    try {
      const { data, error } = await supabase
        .from('email_signups')
        .select('*')
        .order('subscribed_at', { ascending: false });
      
      if (error) throw error;
      setEmailSignups(data || []);
    } catch (error) {
      console.error('Error fetching email signups:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Use admin client for full permissions
      const adminClient = getAdminClient();
      const { error } = adminClient
        ? await adminClient.from('orders').update({ status: newStatus }).eq('id', orderId)
        : await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });
      
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      // Use admin client for full permissions
      const adminClient = getAdminClient();
      const { error } = adminClient
        ? await adminClient.from('orders').delete().eq('id', orderId)
        : await supabase.from('orders').delete().eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Order deleted",
        description: "Order has been removed successfully",
      });
      
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData: any = {
        name: productForm.product_name,
        price: parseFloat(productForm.price),
        collection: productForm.collection,
        stock: parseInt(productForm.stock),
        sizes: productForm.sizes,
        gsm: productForm.gsm_options,
        description: productForm.description,
        featured: productForm.featured,
        tags: productForm.tags,
        discount_percentage: productForm.discount_percentage,
        image_url: productForm.images[0] || null,
        image_file_path: productForm.images.join(',') // Store all images as comma-separated
      };

      // Use admin client for full permissions
      const adminClient = getAdminClient();
      let result;
      
      if (editingProduct) {
        // Update existing product
        result = adminClient 
          ? await adminClient.from('products').update(productData).eq('id', editingProduct)
          : await supabase.from('products').update(productData).eq('id', editingProduct);
      } else {
        // Insert new product
        result = adminClient 
          ? await adminClient.from('products').insert([productData])
          : await supabase.from('products').insert([productData]);
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
      // Refresh products list
      fetchProducts();
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

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      // Use admin client for full permissions
      const adminClient = getAdminClient();
      const { error, data } = adminClient
        ? await adminClient.from('products').delete().eq('id', id).select()
        : await supabase.from('products').delete().eq('id', id).select();

      if (error) {
        console.error('Delete error:', error);
        throw new Error(error.message);
      }

      console.log('Delete successful, affected rows:', data);
      
      toast({
        title: "Product deleted",
        description: "Product has been removed and synced across all pages.",
      });

      // Refresh the product list to reflect the deletion
      fetchProducts();
      
      // Products will auto-refresh via real-time subscription as well
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error deleting product",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const editProduct = (product: Product) => {
    setProductForm({
      product_name: product.product_name || product.name || "",
      price: (product.price || 0).toString(),
      collection: product.collection || "",
      stock: (product.stock || 0).toString(),
      sizes: product.sizes || [],
      gsm_options: product.gsm_options || product.gsm || [],
      description: product.description || "",
      featured: product.featured || false,
      tags: product.tags || [],
      discount_percentage: product.discount_percentage || 0,
      images: product.image_file_path ? product.image_file_path.split(',').filter((img: string) => img.trim()) : (product.image_url ? [product.image_url] : [])
    });
    setEditingProduct(product.id);
  };

  const resetForm = () => {
    setProductForm({
      product_name: "",
      price: "",
      collection: "",
      stock: "",
      sizes: [],
      gsm_options: [],
      description: "",
      featured: false,
      tags: [],
      discount_percentage: 0,
      images: []
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

  const toggleGsm = (gsm: number) => {
    setProductForm(prev => ({
      ...prev,
      gsm_options: prev.gsm_options.includes(gsm)
        ? prev.gsm_options.filter(g => g !== gsm)
        : [...prev.gsm_options, gsm]
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
    
    try {
      // Use admin client for full permissions
      const adminClient = getAdminClient();
      const { error } = adminClient
        ? await adminClient.from('sale_banners').insert([bannerForm])
        : await supabase.from('sale_banners').insert([bannerForm]);

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
    try {
      // Use admin client for full permissions
      const adminClient = getAdminClient();
      const { error } = adminClient
        ? await adminClient.from('sale_banners').update({ is_active: !currentStatus }).eq('id', id)
        : await supabase.from('sale_banners').update({ is_active: !currentStatus }).eq('id', id);

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

  // Enhanced image upload function with better error handling
  const handleImageUpload = async (file: File) => {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, JPG, PNG, and WebP images are allowed');
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }
      
      // Generate unique file name
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      // Check if images bucket exists, create it if not
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          console.warn('Error listing buckets:', bucketError);
        } else {
          const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
          
          if (!imagesBucket) {
            // Try to create the bucket
            const { error: createError } = await supabase.storage.createBucket('images', {
              public: true
            });
            
            if (createError) {
              console.warn('Could not create images bucket:', createError);
            } else {
              console.log('Successfully created images bucket');
            }
          }
        }
      } catch (bucketError) {
        console.warn('Error checking/creating images bucket:', bucketError);
      }
      
      // Try to upload file using admin client for full permissions
      const adminClient = getAdminClient();
      const { data: uploadData, error: uploadError } = adminClient
        ? await adminClient.storage.from('images').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          })
        : await supabase.storage.from('images').upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });
      
      // Handle upload errors gracefully
      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // If it's a bucket not found error, provide specific instructions
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "images" not found. Please create an "images" bucket in your Supabase Storage dashboard and set it as public.');
        }
        
        // If it's a storage permission error, provide a more helpful message
        if (uploadError.message.includes('row-level security') || uploadError.message.includes('permission')) {
          throw new Error('Storage permission error. Please ensure the "images" bucket exists and has proper permissions configured in Supabase Storage.');
        }
        
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: { publicUrl } } = adminClient
        ? adminClient.storage.from('images').getPublicUrl(filePath)
        : supabase.storage.from('images').getPublicUrl(filePath);
      
      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }
      
      return publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-reforma-brown mx-auto mb-4" />
              <CardTitle className="serif-heading text-2xl text-reforma-brown">Admin Access</CardTitle>
              <p className="text-muted-foreground">Sign in to manage your RĒFORMA collection</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
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
                <Button type="submit" className="w-full btn-reforma">
                  Access Admin Panel
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your RĒFORMA collection</p>
        </div>

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
              {/* Database Health Card */}
              <Card className={dbHealth.status === 'healthy' ? 'border-green-500' : dbHealth.status === 'error' ? 'border-red-500' : 'border-yellow-500'}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                  {dbHealth.status === 'healthy' ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : dbHealth.status === 'error' ? (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-sm ${dbHealth.status === 'healthy' ? 'text-green-600' : dbHealth.status === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {dbHealth.message}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={checkDatabaseHealth}
                  >
                    Refresh Status
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-reforma-brown">{stats.totalProducts}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-reforma-brown">{stats.totalOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Signups</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-reforma-brown">{stats.emailSignups}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-reforma-brown">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.product_name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, product_name: e.target.value }))}
                        placeholder="SAGE REFLECTION"
                        required
                        className="input-reforma"
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
                          placeholder="85.00"
                          required
                          className="input-reforma"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                          placeholder="12"
                          required
                          className="input-reforma"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="collection">Collection</Label>
                      <Select 
                        value={productForm.collection} 
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, collection: value }))}
                      >
                        <SelectTrigger className="input-reforma">
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
                        value={productForm.images.join(', ')}
                        onChange={(e) => setProductForm(prev => ({ ...prev, images: e.target.value.split(', ').filter(img => img.trim()) }))}
                        placeholder="https://example.com/image.jpg or upload below"
                        className="input-reforma"
                      />
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (files) {
                              setUploadingImages(true);
                              try {
                                const uploadPromises = Array.from(files).map(file => handleImageUpload(file));
                                const publicUrls = await Promise.all(uploadPromises);
                                setProductForm(prev => ({ ...prev, images: [...prev.images, ...publicUrls] }));
                                toast({
                                  title: "Images uploaded!",
                                  description: `${files.length} image(s) have been uploaded successfully.`,
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Upload failed",
                                  description: error.message || "Failed to upload images.",
                                  variant: "destructive",
                                });
                              } finally {
                                setUploadingImages(false);
                                // Reset the file input
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }
                            }
                          }}
                          className="text-sm text-muted-foreground"
                          ref={fileInputRef}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload multiple JPEG, JPG, PNG, or WebP images (max 5MB each)
                        </p>
                        {uploadingImages && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploading images...
                          </p>
                        )}
                      </div>
                      
                      {/* Display uploaded images */}
                      {productForm.images.length > 0 && (
                        <div className="mt-4">
                          <Label>Uploaded Images</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {productForm.images.map((url, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`Product image ${index + 1}`} 
                                  className="w-full h-24 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    setProductForm(prev => ({
                                      ...prev,
                                      images: prev.images.filter((_, i) => i !== index)
                                    }));
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                            className={productForm.sizes.includes(size) ? "btn-reforma" : "border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>GSM Options</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {gsmOptions.map(gsm => (
                          <Button
                            key={gsm}
                            type="button"
                            variant={productForm.gsm_options.includes(gsm) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleGsm(gsm)}
                            className={productForm.gsm_options.includes(gsm) ? "btn-reforma" : "border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"}
                          >
                            {gsm} GSM
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
                            className={productForm.tags.includes(tag) ? "btn-reforma" : "border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                      <Input
                        id="discount_percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={productForm.discount_percentage}
                        onChange={(e) => setProductForm(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        className="input-reforma"
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
                        placeholder="Sophisticated simplicity in muted sage..."
                        rows={3}
                        className="input-reforma"
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
                      <Button type="submit" className="btn-reforma flex-1">
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                      {editingProduct && (
                        <Button type="button" variant="outline" className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5" onClick={resetForm}>
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
                  <CardTitle className="serif-heading text-xl text-reforma-brown">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{product.product_name || product.name || "Unnamed Product"}</h4>
                            {(product.featured || product.is_featured) && (
                              <Badge variant="secondary" className="text-xs badge-reforma">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price || 0} • {product.collection || "Unknown"} • {product.stock || 0} in stock
                          </p>
                          {(product.gsm_options || product.gsm) && (product.gsm_options || product.gsm).length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              GSM: {(product.gsm_options || product.gsm).join(', ')}
                            </p>
                          )}
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
                            className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                            className="border-destructive text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
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
                <CardTitle className="serif-heading text-xl text-reforma-brown flex items-center justify-between">
                  <span>Recent Orders</span>
                  <Badge variant="secondary" className="badge-reforma">
                    {orders.length} Total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No orders yet. Orders will appear here as customers complete purchases.</p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {orders.map(order => (
                      <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-reforma-brown">{order.product_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Collection: {order.collection} | Size: {order.size}
                              {order.gsm && ` | GSM: ${order.gsm}`}
                            </p>
                          </div>
                          <Badge 
                            className={`
                              ${order.status === 'Pending' ? 'bg-yellow-500' : 
                                order.status === 'Processing' ? 'bg-blue-500' :
                                order.status === 'Shipped' ? 'bg-purple-500' :
                                order.status === 'Delivered' ? 'bg-green-500' :
                                'bg-gray-500'} text-white
                            `}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        
                        {(order.customer_name || order.customer_email || order.customer_phone) && (
                          <div className="bg-muted/50 p-3 rounded space-y-1">
                            <p className="text-sm font-medium text-reforma-brown">Customer Details:</p>
                            {order.customer_name && <p className="text-sm">Name: {order.customer_name}</p>}
                            {order.customer_email && <p className="text-sm">Email: {order.customer_email}</p>}
                            {order.customer_phone && <p className="text-sm">Phone: {order.customer_phone}</p>}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-lg font-bold text-reforma-brown">₹{Number(order.total_amount).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-32 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-destructive border-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle className="serif-heading text-xl text-reforma-brown flex items-center justify-between">
                  <span>Email Subscribers</span>
                  <Badge variant="secondary" className="badge-reforma">
                    {emailSignups.length} Subscribers
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emailSignups.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No email subscribers yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {emailSignups.map(signup => (
                      <div key={signup.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{signup.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Subscribed: {new Date(signup.subscribed_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Banner Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-reforma-brown">Create Sale Banner</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBannerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="banner-message">Banner Message</Label>
                      <Input
                        id="banner-message"
                        value={bannerForm.message}
                        onChange={(e) => setBannerForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Flat 20% OFF on Winter Collection"
                        required
                        className="input-reforma"
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

                    <Button type="submit" className="btn-reforma w-full">
                      Create Banner
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Banners List */}
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-reforma-brown">Active Banners</CardTitle>
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
                          className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
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