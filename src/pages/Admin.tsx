import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '@/lib/api';
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
import { Plus, Edit, Trash2, Upload, Users, Package, Mail, Shield, User, FolderOpen, X, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Global mock for Supabase to prevent the old functions from crashing the page
// before their respective backend routes are connected.
const supabase: any = {
  auth: {
    signOut: () => Promise.resolve(),
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  channel: () => ({
    on: () => ({
      subscribe: () => {}
    }),
    subscribe: () => {}
  }),
  removeChannel: () => {},
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: {}, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } })
    }),
    listBuckets: () => Promise.resolve({ data: [], error: null }),
    createBucket: () => Promise.resolve({ error: null })
  }
};

// Use a flexible type that can handle both old and new data structures
interface Product {
  id: string;
  [key: string]: any; // Allow any additional properties
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  parent_name?: string | null;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [parentCollectionForm, setParentCollectionForm] = useState({ name: '', description: '' });
  const [subCollectionForm, setSubCollectionForm] = useState({ name: '', description: '', parentId: '' });
  const [editCollectionForm, setEditCollectionForm] = useState({ name: '', description: '', parentId: '' });
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [collectionLoadingTarget, setCollectionLoadingTarget] = useState<"parent" | "sub" | "edit" | null>(null);
  const [selectedParentCollectionId, setSelectedParentCollectionId] = useState("");
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
    discount_percentage: null as number | null,
    images: [] as string[]
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    emailSignups: 0,
    totalUsers: 0
  });
  const [saleBanners, setSaleBanners] = useState<any[]>([]);
  const [bannerForm, setBannerForm] = useState({ message: "", is_active: true });
  const { toast } = useToast();
  const [dbHealth, setDbHealth] = useState<{status: string, message: string}>({status: 'checking', message: 'Checking database connection...'});
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [emailSignups, setEmailSignups] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [usePremiumAnimation, setUsePremiumAnimation] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const gsmOptions = [180, 210, 220, 240];
  const availableTags = ["New Arrival", "Winter Collection", "Discount", "Sale", "Limited Edition", "Bestseller"];
  const topLevelCollections = collections.filter((collection) => !collection.parent_id);
  const selectedParentCollection = topLevelCollections.find((collection) => collection.id === selectedParentCollectionId) ?? null;
  const childCollections = selectedParentCollectionId
    ? collections.filter((collection) => collection.parent_id === selectedParentCollectionId)
    : [];
  const availableParentCollections = topLevelCollections.filter((collection) => collection.id !== editingCollection);
  const selectedSubCollectionId = childCollections.find((collection) => collection.name === productForm.collection)?.id ?? "__main__";
  const collectionGroups = topLevelCollections.map((collection) => ({
    ...collection,
    children: collections.filter((candidate) => candidate.parent_id === collection.id),
  }));

  // Database health check
  const checkDatabaseHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) {
        setDbHealth({status: 'healthy', message: 'Backend API connected successfully'});
        return true;
      }
      setDbHealth({status: 'error', message: 'Backend API returned an error'});
      return false;
    } catch (error: any) {
      setDbHealth({status: 'error', message: `Connection failed: ${error.message}`});
      return false;
    }
  };

  // Check if current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      // First check localStorage (cross-origin reliable, set after login)
      const stored = localStorage.getItem('auth');
      if (stored) {
        try {
          const { isAdmin: storedIsAdmin } = JSON.parse(stored);
          if (storedIsAdmin) {
            setIsAuthenticated(true);
            return;
          }
        } catch {}
      }

      // Fallback: cookie-based check
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
        if (!response.ok) {
          window.location.href = '/auth?admin=true';
          return;
        }
        
        const sessionData = await response.json();
        
        if (!sessionData.isAdmin) {
          await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges. Please use regular user login.",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
          return;
        }
        
        // Valid admin user
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth check failed", err);
        window.location.href = '/auth?admin=true';
      }
    };
    
    checkAdminStatus();
    
    // Check if premium animation is enabled
    const premiumSetting = localStorage.getItem('reforma_premium_welcome');
    if (premiumSetting !== null) {
      setUsePremiumAnimation(premiumSetting === 'true');
    }
    
    checkDatabaseHealth();
    fetchProducts();
    fetchCollections();
    fetchStats();
    fetchSaleBanners();
    fetchOrders();
    fetchEmailSignups();
    fetchUsers();
    
    // Real-time subscriptions disabled until web sockets are implemented
    /*
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

    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        fetchStats();
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(bannersChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(emailsChannel);
      supabase.removeChannel(usersChannel);
    };
    */
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(data as Product[] || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({ title: "Error", description: error.message || "Failed to load products", variant: "destructive" });
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/collections`);
      const data = await res.json();
      setCollections(Array.isArray(data) ? (data as Collection[]) : []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const submitCollection = async (
    form: { name: string; description: string; parentId?: string },
    target: "parent" | "sub" | "edit",
    editingId?: string | null,
  ) => {
    if (!form.name.trim()) return;

    setCollectionLoadingTarget(target);
    try {
      const url = editingId
        ? `${API_BASE_URL}/api/collections/${editingId}`
        : `${API_BASE_URL}/api/collections`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          parentId: form.parentId || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Operation failed');
      toast({
        title: editingId ? 'Collection updated!' : target === 'parent' ? 'Parent collection created!' : 'Sub-collection created!',
        description: `"${form.name}" saved successfully.`,
      });

      if (target === 'parent') {
        setParentCollectionForm({ name: '', description: '' });
      }

      if (target === 'sub') {
        setSubCollectionForm((prev) => ({ ...prev, name: '', description: '' }));
      }

      if (target === 'edit') {
        setEditCollectionForm({ name: '', description: '', parentId: '' });
        setEditingCollection(null);
      }

      fetchCollections();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCollectionLoadingTarget(null);
    }
  };

  const handleParentCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCollection(parentCollectionForm, 'parent');
  };

  const handleSubCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCollection(subCollectionForm, 'sub');
  };

  const handleEditCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCollection(editCollectionForm, 'edit', editingCollection);
  };

  const deleteCollection = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"?\n\nThis will also CLEAR the collection field on all products in this collection � they will appear as uncategorized until you re-assign them.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/collections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
      const data = await res.json();
      toast({ title: 'Collection deleted', description: `"${name}" removed. ${data._cascadeInfo || ''}` });
      fetchCollections();
      fetchProducts(); // refresh product list since collection fields were cleared
    } catch (error: any) {
      toast({ title: 'Error deleting collection', description: error.message, variant: 'destructive' });
    }
  };

  const syncProducts = async () => {
    if (!confirm('This will clear the collection field on all products whose collection no longer exists in the database. Continue?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/collections/sync-products`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sync failed');
      toast({
        title: 'Sync complete ?',
        description: `${data.affected ?? 0} product(s) had stale collection names cleared.`,
      });
      fetchProducts();
    } catch (error: any) {
      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
    }
  };

  const startEditCollection = (col: Collection) => {
    setEditingCollection(col.id);
    setEditCollectionForm({ name: col.name, description: col.description || '', parentId: col.parent_id || '' });
  };

  const cancelEditCollection = () => {
    setEditingCollection(null);
    setEditCollectionForm({ name: '', description: '', parentId: '' });
  };

  const fetchStats = async () => {
    try {
      const [products, orders, emails, users] = await Promise.all([
        fetch(`${API_BASE_URL}/api/products`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/orders`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/emails`).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/users`).then(r => r.json()),
      ]);
      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        emailSignups: Array.isArray(emails) ? emails.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchEmailSignups = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/emails`);
      const data = await res.json();
      setEmailSignups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching email signups:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Update failed');
      toast({ title: "Order updated", description: `Order status changed to ${newStatus}` });
      fetchOrders();
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
      toast({ title: "Order deleted", description: "Order has been removed successfully" });
      fetchOrders();
      fetchStats();
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData: any = {
        product_name: productForm.product_name,
        price: parseFloat(productForm.price),
        collection: productForm.collection,
        stock: parseInt(productForm.stock),
        sizes: productForm.sizes,
        gsm_options: productForm.gsm_options,
        description: productForm.description,
        featured: productForm.featured,
        tags: productForm.tags,
        discount: productForm.discount_percentage ?? 0,
        images: productForm.images
      };

      const url = editingProduct
        ? `${API_BASE_URL}/api/products/${editingProduct}`
        : `${API_BASE_URL}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to save product');

      toast({ title: editingProduct ? "Product updated!" : "Product created!", description: "Changes saved successfully." });
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error saving product", description: error.message || "Please check your input.", variant: "destructive" });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete product');
      toast({ title: "Product deleted", description: "Product has been removed successfully." });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error deleting product", description: error.message || "Failed to delete product.", variant: "destructive" });
    }
  };

  const editProduct = (product: Product) => {
    const matchedCollection = collections.find((collection) => collection.name === (product.collection || ''));
    setSelectedParentCollectionId(matchedCollection?.parent_id || matchedCollection?.id || '');
    setProductForm({
      product_name: product.product_name || "",
      price: (product.price || 0).toString(),
      collection: product.collection || "",
      stock: (product.stock || 0).toString(),
      sizes: product.sizes || [],
      gsm_options: product.gsm_options || [],
      description: product.description || "",
      featured: product.featured || false,
      tags: product.tags || [],
      discount_percentage: product.discount !== undefined && product.discount !== null ? product.discount : null,
      images: product.images || []
    });
    setEditingProduct(product.id);
  };

  const resetForm = () => {
    setSelectedParentCollectionId("");
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
      discount_percentage: null,
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
      const res = await fetch(`${API_BASE_URL}/api/banners`);
      const data = await res.json();
      setSaleBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sale banners:', error);
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to create banner');
      toast({ title: "Banner created!", description: "Sale banner has been added and is now live." });
      setBannerForm({ message: "", is_active: true });
      fetchSaleBanners();
    } catch (error: any) {
      toast({ title: "Error creating banner", description: error.message || "Failed to create banner.", variant: "destructive" });
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/banners/${id}/toggle`, { method: 'PATCH' });
      if (!res.ok) throw new Error((await res.json()).message || 'Update failed');
      toast({ title: "Banner updated!", description: `Banner is now ${!currentStatus ? 'active' : 'inactive'}.` });
      fetchSaleBanners();
    } catch (error: any) {
      toast({ title: "Error updating banner", description: error.message || "Failed to update banner.", variant: "destructive" });
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/banners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
      toast({ title: "Banner deleted!", description: "Banner has been permanently removed." });
      fetchSaleBanners();
    } catch (error: any) {
      toast({ title: "Error deleting banner", description: error.message || "Failed to delete banner.", variant: "destructive" });
    }
  };

  // Enhanced image upload function with Cloudinary backend
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
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      return data.url; // Returns the secure Cloudinary URL
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-reforma-brown mx-auto mb-4 animate-pulse" />
            <CardTitle className="serif-heading text-2xl text-reforma-brown">Verifying Admin Access</CardTitle>
            <p className="text-muted-foreground">Checking your credentials...</p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your R-�FORMA collection</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="emails">Email List</TabsTrigger>
            <TabsTrigger value="banners">Sale Banners</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Welcome Animation Toggle */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Welcome Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Premium Animation</p>
                      <p className="text-xs text-muted-foreground">Enable luxury intro animation</p>
                    </div>
                    <Switch
                      checked={usePremiumAnimation}
                      onCheckedChange={(checked) => {
                        setUsePremiumAnimation(checked);
                        localStorage.setItem('reforma_premium_welcome', checked.toString());
                        toast({
                          title: "Settings updated",
                          description: `Premium animation ${checked ? 'enabled' : 'disabled'}`,
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              
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
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-reforma-brown">{stats.totalOrders}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-reforma-brown">{stats.totalUsers}</div>
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
                        <Label htmlFor="price">Price (G�)</Label>
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
                      <Label htmlFor="collection-parent">Main Collection</Label>
                      <Select 
                        value={selectedParentCollectionId || "__none__"}
                        onValueChange={(value) => {
                          if (value === "__none__") {
                            setSelectedParentCollectionId("");
                            setProductForm(prev => ({ ...prev, collection: "" }));
                            return;
                          }

                          const mainCollection = topLevelCollections.find((collection) => collection.id === value);
                          setSelectedParentCollectionId(value);
                          setProductForm(prev => ({ ...prev, collection: mainCollection?.name || "" }));
                        }}
                      >
                        <SelectTrigger id="collection-parent" className="input-reforma">
                          <SelectValue placeholder="Select main collection" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">No collection</SelectItem>
                          {topLevelCollections.map(col => (
                            <SelectItem key={col.id} value={col.id}>
                              {col.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {collections.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">? No collections yet � create one in the Collections tab first.</p>
                      )}
                    </div>

                    {selectedParentCollectionId && childCollections.length > 0 && (
                      <div>
                        <Label htmlFor="sub-collection">Sub-Collection</Label>
                        <Select
                          value={selectedSubCollectionId}
                          onValueChange={(value) => {
                            if (value === "__main__") {
                              setProductForm(prev => ({ ...prev, collection: selectedParentCollection?.name || "" }));
                              return;
                            }

                            const subCollection = childCollections.find((collection) => collection.id === value);
                            if (subCollection) {
                              setProductForm(prev => ({ ...prev, collection: subCollection.name }));
                            }
                          }}
                        >
                          <SelectTrigger id="sub-collection" className="input-reforma">
                            <SelectValue placeholder="Select sub-collection" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__main__">Use main collection only</SelectItem>
                            {childCollections.map((collection) => (
                              <SelectItem key={collection.id} value={collection.id}>
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose a sub-collection only when the product should live under a specific drop inside {selectedParentCollection?.name}.
                        </p>
                      </div>
                    )}

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
                        value={productForm.discount_percentage ?? ""}
                        onChange={(e) => setProductForm(prev => ({ ...prev, discount_percentage: e.target.value ? parseInt(e.target.value) : null }))}
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
                            G�{product.price || 0} G�� {product.collection || "Unknown"} G�� {product.stock || 0} in stock
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

          {/* -- Collections Tab ------------------------------------------- */}
          <TabsContent value="collections" className="space-y-6">
            {editingCollection && (
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-reforma-brown flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Edit Collection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEditCollectionSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-col-name">Collection Name *</Label>
                        <Input
                          id="edit-col-name"
                          value={editCollectionForm.name}
                          onChange={(e) => setEditCollectionForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. Drop 01"
                          required
                          className="input-reforma"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-col-parent">Parent Collection</Label>
                        <Select
                          value={editCollectionForm.parentId || "__root__"}
                          onValueChange={(value) => setEditCollectionForm((prev) => ({
                            ...prev,
                            parentId: value === "__root__" ? '' : value,
                          }))}
                        >
                          <SelectTrigger id="edit-col-parent" className="input-reforma">
                            <SelectValue placeholder="No parent collection" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__root__">No parent collection</SelectItem>
                            {availableParentCollections.map((collection) => (
                              <SelectItem key={collection.id} value={collection.id}>
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-col-desc">Description (optional)</Label>
                      <Textarea
                        id="edit-col-desc"
                        value={editCollectionForm.description}
                        onChange={(e) => setEditCollectionForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Update the description for this collection..."
                        rows={3}
                        className="input-reforma"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="btn-reforma flex-1" disabled={collectionLoadingTarget === 'edit'}>
                        {collectionLoadingTarget === 'edit' ? 'Saving...' : 'Update Collection'}
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelEditCollection} className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-reforma-brown flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Create Parent Collection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleParentCollectionSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="parent-col-name">Parent Collection Name *</Label>
                      <Input
                        id="parent-col-name"
                        value={parentCollectionForm.name}
                        onChange={(e) => setParentCollectionForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Drop Series"
                        required
                        className="input-reforma"
                      />
                    </div>
                    <div>
                      <Label htmlFor="parent-col-desc">Description (optional)</Label>
                      <Textarea
                        id="parent-col-desc"
                        value={parentCollectionForm.description}
                        onChange={(e) => setParentCollectionForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the main collection..."
                        rows={3}
                        className="input-reforma"
                      />
                    </div>
                    <Button type="submit" className="btn-reforma w-full" disabled={collectionLoadingTarget === 'parent'}>
                      {collectionLoadingTarget === 'parent' ? 'Saving...' : 'Create Parent Collection'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-reforma-brown flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Create Sub-Collection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubCollectionSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="sub-col-parent">Parent Collection *</Label>
                      <Select
                        value={subCollectionForm.parentId || "__select__"}
                        onValueChange={(value) => setSubCollectionForm((prev) => ({
                          ...prev,
                          parentId: value === "__select__" ? '' : value,
                        }))}
                        disabled={topLevelCollections.length === 0}
                      >
                        <SelectTrigger id="sub-col-parent" className="input-reforma">
                          <SelectValue placeholder="Choose parent collection" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__select__">Choose parent collection</SelectItem>
                          {topLevelCollections.map((collection) => (
                            <SelectItem key={collection.id} value={collection.id}>
                              {collection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create multiple sub-collections like Drop 01, Drop 02, or Summer Drop 01 under any parent collection.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="sub-col-name">Sub-Collection Name *</Label>
                      <Input
                        id="sub-col-name"
                        value={subCollectionForm.name}
                        onChange={(e) => setSubCollectionForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Drop 01"
                        required
                        className="input-reforma"
                        disabled={topLevelCollections.length === 0}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sub-col-desc">Description (optional)</Label>
                      <Textarea
                        id="sub-col-desc"
                        value={subCollectionForm.description}
                        onChange={(e) => setSubCollectionForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this sub-collection..."
                        rows={3}
                        className="input-reforma"
                        disabled={topLevelCollections.length === 0}
                      />
                    </div>
                    {topLevelCollections.length === 0 && (
                      <p className="text-sm text-amber-700">Create a parent collection first, then add sub-collections under it.</p>
                    )}
                    <Button type="submit" className="btn-reforma w-full" disabled={collectionLoadingTarget === 'sub' || topLevelCollections.length === 0 || !subCollectionForm.parentId}>
                      {collectionLoadingTarget === 'sub' ? 'Saving...' : 'Create Sub-Collection'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="serif-heading text-xl text-reforma-brown flex items-center justify-between">
                  <span>Collection Structure</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncProducts}
                      className="border-amber-400 text-amber-700 hover:bg-amber-50 text-xs flex items-center gap-1.5"
                      title="Fix stale product collection names"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Sync Products
                    </Button>
                    <Badge variant="secondary" className="badge-reforma">{collections.length} Total</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collections.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No collections yet. Create your first parent collection and then add sub-collections under it.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {collectionGroups.map((group) => (
                      <div key={group.id} className={`rounded-xl border p-4 space-y-4 ${editingCollection === group.id ? 'border-reforma-brown bg-reforma-brown/5' : 'border-border'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <FolderOpen className="h-4 w-4 text-reforma-brown shrink-0" />
                              <h4 className="font-semibold text-reforma-brown truncate">{group.name}</h4>
                              <Badge variant="secondary" className="text-xs">Parent</Badge>
                              <Badge variant="outline" className="text-xs">{group.children.length} sub-collections</Badge>
                              {editingCollection === group.id && <Badge variant="secondary" className="text-xs">Editing</Badge>}
                            </div>
                            {group.description && (
                              <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditCollection(group)}
                              className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCollection(group.id, group.name)}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-4">
                          <p className="text-sm font-medium text-reforma-brown mb-3">Sub-collections under {group.name}</p>
                          {group.children.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No sub-collections yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {group.children.map((child) => (
                                <div
                                  key={child.id}
                                  className={`flex items-start justify-between gap-4 rounded-lg border bg-background p-3 ${editingCollection === child.id ? 'border-reforma-brown' : 'border-border'}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <FolderOpen className="h-4 w-4 text-reforma-brown shrink-0" />
                                      <h5 className="font-medium text-reforma-brown truncate">{child.name}</h5>
                                      <Badge variant="outline" className="text-xs">Sub-collection</Badge>
                                      {editingCollection === child.id && <Badge variant="secondary" className="text-xs">Editing</Badge>}
                                    </div>
                                    {child.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{child.description}</p>
                                    )}
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => startEditCollection(child)}
                                      className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteCollection(child.id, child.name)}
                                      className="border-destructive text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                        
                        {(order.customer_name || order.customer_email || order.customer_phone || order.customer_address) && (
                          <div className="bg-muted/50 p-3 rounded space-y-1">
                            <p className="text-sm font-medium text-reforma-brown">Customer Details:</p>
                            {order.customer_name && <p className="text-sm">Name: {order.customer_name}</p>}
                            {order.customer_email && <p className="text-sm">Email: {order.customer_email}</p>}
                            {order.customer_phone && <p className="text-sm">Phone: {order.customer_phone}</p>}
                            {order.customer_address && <p className="text-sm">Address: {order.customer_address}</p>}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <p className="text-lg font-bold text-reforma-brown">G�{Number(order.total_amount).toFixed(2)}</p>
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

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="serif-heading text-xl text-reforma-brown flex items-center justify-between">
                  <span>Registered Users</span>
                  <Badge variant="secondary" className="badge-reforma">
                    {users.length} Users
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No registered users yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.name} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-reforma-sage"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-reforma-sage flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-reforma-brown">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-muted-foreground">Phone: {user.phone}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
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
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                            className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                          >
                            {banner.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteBanner(banner.id)}
                          >
                            Delete
                          </Button>
                        </div>
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
