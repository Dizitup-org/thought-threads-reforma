import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Package, MapPin, Settings, LogOut, Plus, Edit, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

interface UserProfile extends Tables<"users"> {}
interface Address extends Tables<"addresses"> {}
interface Order extends Tables<"orders"> {
  addresses?: Pick<Tables<"addresses">, "id" | "address_line" | "city" | "state" | "pincode" | "country" | "is_default"> | null;
}
interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    collection: string;
    discounted_price: number | null;
    is_on_sale: boolean | null;
  };
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [newAddress, setNewAddress] = useState({
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check URL params for active tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      await fetchUserData();
    };
    
    checkAuth();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return;
      }

      if (profile) {
        setUser(profile);
        setProfileForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || ""
        });
        
        // Fetch addresses
        const { data: addressesData } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });
        
        setAddresses(addressesData || []);

        // Fetch orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select(`
            *,
            addresses (
              id,
              address_line,
              city,
              state,
              pincode,
              country,
              is_default
            )
          `)
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });
        
        setOrders(ordersData || []);

        // Fetch wishlist
        const { data: wishlistData } = await supabase
          .from("wishlist")
          .select(`
            id,
            product_id,
            created_at,
            products (
              id,
              name,
              price,
              image_url,
              collection,
              discounted_price,
              is_on_sale
            )
          `)
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });
        
        setWishlist(wishlistData || []);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    
    // Get auth user ID for proper RLS
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      toast({
        title: "Error",
        description: "You must be logged in to upload a profile picture",
        variant: "destructive",
      });
      return;
    }
    
    const fileName = `${authUser.id}.${fileExt}`;
    const filePath = `${authUser.id}/${fileName}`;
    
    setIsUploading(true);
    
    try {
      // Upload file with correct folder structure for RLS
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        // If it's a bucket not found error, provide a more helpful message
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error("Storage bucket \"avatars\" not found. Please ensure the bucket exists in your Supabase Storage dashboard and is set as public.");
        }
        throw uploadError;
      }
      
      // Get public URL with cache busting timestamp
      const timestamp = new Date().getTime();
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      const publicUrlWithTimestamp = `${publicUrl}?t=${timestamp}`;
      
      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      
      if (updateError) throw updateError;
      
      // Update local state with timestamped URL for immediate display
      setUser({ ...user, avatar_url: publicUrlWithTimestamp });
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload avatar. Please check that the 'avatars' bucket exists and is public in your Supabase dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const saveAddress = async () => {
    if (!user) return;
    
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from("addresses")
          .update(newAddress)
          .eq("id", editingAddress.id);
        
        if (error) throw error;
        toast({ title: "Address updated successfully!" });
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert([{ ...newAddress, user_id: user.id }]);
        
        if (error) throw error;
        toast({ title: "Address added successfully!" });
      }
      
      setNewAddress({ address_line: "", city: "", state: "", pincode: "", country: "India" });
      setEditingAddress(null);
      setIsAddressDialogOpen(false);
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Address deleted successfully!" });
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          name: profileForm.name, 
          phone: profileForm.phone
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Update local state
      setUser({ 
        ...user, 
        name: profileForm.name, 
        phone: profileForm.phone
      });
      
      toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) throw error;
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Delete user data from all tables
      await supabase.from("addresses").delete().eq("user_id", user.id);
      await supabase.from("orders").delete().eq("user_id", user.id);
      await supabase.from("users").delete().eq("id", user.id);
      
      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.auth_user_id);
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div 
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                        {user?.avatar_url ? (
                          <motion.img 
                            src={user.avatar_url} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-reforma-sage"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                          />
                        ) : (
                          <motion.div 
                            className="w-24 h-24 rounded-full bg-reforma-sage flex items-center justify-center"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <User className="w-12 h-12 text-reforma-brown" />
                          </motion.div>
                        )}
                        <motion.label 
                          className="absolute bottom-0 right-0 bg-reforma-brown text-white rounded-full p-2 cursor-pointer hover:bg-reforma-brown/90 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Upload className="w-4 h-4" />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleAvatarUpload}
                            disabled={isUploading}
                          />
                        </motion.label>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isUploading ? "Uploading..." : "Upload profile picture"}
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={profileForm.email} disabled />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={profileForm.phone || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <Button onClick={updateProfile}>
                        Update Profile
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="addresses">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>Manage your delivery addresses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="mb-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingAddress ? "Edit Address" : "Add New Address"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Address Line</Label>
                            <Input
                              placeholder="Street address"
                              value={newAddress.address_line}
                              onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>City</Label>
                              <Input
                                placeholder="City"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>State</Label>
                              <Input
                                placeholder="State"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Pincode</Label>
                              <Input
                                placeholder="Pincode"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Country</Label>
                              <Input
                                placeholder="Country"
                                value={newAddress.country}
                                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button onClick={saveAddress}>
                            {editingAddress ? "Update Address" : "Add Address"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {addresses.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No addresses saved</p>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address, index) => (
                          <motion.div 
                            key={address.id} 
                            className="border rounded-lg p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm">{address.address_line}</p>
                                <p className="text-sm text-muted-foreground">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="text-sm text-muted-foreground">{address.country}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingAddress(address);
                                    setNewAddress({
                                      address_line: address.address_line,
                                      city: address.city,
                                      state: address.state,
                                      pincode: address.pincode,
                                      country: address.country
                                    });
                                    setIsAddressDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteAddress(address.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="orders">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription>Track your order history and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No orders yet</p>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order, index) => (
                          <motion.div 
                            key={order.id} 
                            className="border rounded-lg p-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={order.status === "Approved" ? "default" : order.status === "Disapproved" ? "destructive" : "secondary"}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-sm mb-2">
                              <p><strong>Product:</strong> {order.product_name} (Size: {order.size})</p>
                              <p><strong>Collection:</strong> {order.collection}</p>
                              <p><strong>Total:</strong> ₹{order.total_amount}</p>
                              {order.addresses && (
                                <p><strong>Address:</strong> {order.addresses.address_line}, {order.addresses.city}</p>
                              )}
                            </div>
                            <Button variant="outline" size="sm">
                              Track Order
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="wishlist">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Wishlist</CardTitle>
                    <CardDescription>Your favorite items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-4">
                          Save items that you like to your wishlist
                        </p>
                        <Button asChild>
                          <a href="/shop">Browse Products</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlist.map((item, index) => (
                          <motion.div
                            key={item.id}
                            className="border rounded-lg overflow-hidden"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <a href={`/product/${item.product_id}`}>
                              {item.products.image_url && (
                                <img
                                  src={item.products.image_url}
                                  alt={item.products.name}
                                  className="w-full h-48 object-cover"
                                />
                              )}
                              <div className="p-4">
                                <h3 className="font-semibold mb-1">{item.products.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{item.products.collection}</p>
                                <div className="flex items-center justify-between">
                                  {item.products.is_on_sale ? (
                                    <div>
                                      <p className="text-sm line-through text-muted-foreground">₹{item.products.price}</p>
                                      <p className="font-bold text-destructive">₹{item.products.discounted_price}</p>
                                    </div>
                                  ) : (
                                    <p className="font-bold">₹{item.products.price}</p>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      try {
                                        const { error } = await supabase
                                          .from("wishlist")
                                          .delete()
                                          .eq("id", item.id);
                                        
                                        if (error) throw error;
                                        
                                        toast({
                                          title: "Removed from wishlist",
                                          description: `${item.products.name} has been removed from your wishlist`,
                                        });
                                        
                                        fetchUserData();
                                      } catch (error: any) {
                                        toast({
                                          title: "Error",
                                          description: error.message,
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </a>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={profileForm.email} disabled />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={profileForm.phone || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <Button onClick={updateProfile}>
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Label>Current Password</Label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-6 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleChangePassword}>
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>Permanently delete your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-destructive rounded-lg p-4">
                      <h3 className="font-medium text-destructive mb-2">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        Delete My Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}