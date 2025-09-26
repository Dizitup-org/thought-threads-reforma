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

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  collection: string;
  stock: number;
  sizes: string[];
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
    description: "",
    featured: false,
    image_url: "",
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchCollections();
      fetchStats();
      fetchSaleBanners();
      
      // Set up real-time subscription for products
      const channel = supabase
        .channel('products-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products'
        }, () => {
          fetchProducts();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, use simple authentication
    if (loginForm.email === "admin@reforma.com" && loginForm.password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to admin panel.",
      });
    } else {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
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
        description: productForm.description,
        featured: productForm.featured,
        image_url: productForm.image_url,
        tags: productForm.tags,
        discount_percentage: productForm.discount_percentage
      };

      let error;
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: editingProduct ? "Product updated!" : "Product created!",
        description: "Changes have been saved successfully.",
      });

      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "Product has been removed successfully.",
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const editProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      collection: product.collection,
      stock: product.stock.toString(),
      sizes: product.sizes,
      description: product.description || "",
      featured: product.featured,
      image_url: product.image_url || "",
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
      description: "",
      featured: false,
      image_url: "",
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
    
    try {
      const { error } = await supabase
        .from('sale_banners')
        .insert([bannerForm]);

      if (error) throw error;

      toast({
        title: "Banner created!",
        description: "Sale banner has been added successfully.",
      });

      setBannerForm({ message: "", is_active: true });
      fetchSaleBanners();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sale_banners')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Banner updated!",
        description: "Banner status has been changed.",
      });

      fetchSaleBanners();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update banner.",
        variant: "destructive",
      });
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
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your REFORMA collection</p>
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
                        placeholder="SAGE REFLECTION"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="85.00"
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
                          placeholder="12"
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
                        placeholder="https://example.com/image.jpg or upload below"
                      />
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // For demo - in production this would upload to Supabase Storage
                              const url = URL.createObjectURL(file);
                              setProductForm(prev => ({ ...prev, image_url: url }));
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
                        placeholder="0"
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
                            ${product.price} • {product.collection} • {product.stock} in stock
                          </p>
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
                        placeholder="Flat 20% OFF on Winter Collection"
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