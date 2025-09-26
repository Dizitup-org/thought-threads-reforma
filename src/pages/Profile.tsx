import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Package, MapPin, Settings, LogOut, Plus, Edit, Trash2 } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Address {
  id: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

interface Order {
  id: string;
  products: any;
  total_amount: number;
  status: string;
  created_at: string;
  addresses?: Address;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
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
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);
        
        // Fetch addresses
        const { data: addressesData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        
        setAddresses(addressesData || []);

        // Fetch orders
        const { data: ordersData } = await supabase
          .from('orders')
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
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const saveAddress = async () => {
    if (!user) return;
    
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update(newAddress)
          .eq('id', editingAddress.id);
        
        if (error) throw error;
        toast({ title: "Address updated successfully!" });
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert([{ ...newAddress, user_id: user.id }]);
        
        if (error) throw error;
        toast({ title: "Address added successfully!" });
      }
      
      setNewAddress({ address_line: '', city: '', state: '', pincode: '', country: 'India' });
      setEditingAddress(null);
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
        .from('addresses')
        .delete()
        .eq('id', id);
      
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
        .from('users')
        .update({ name: user.name, phone: user.phone })
        .eq('id', user.id);
      
      if (error) throw error;
      toast({ title: "Profile updated successfully!" });
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
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
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={order.status === 'Approved' ? 'default' : order.status === 'Disapproved' ? 'destructive' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-sm mb-2">
                          <p><strong>Products:</strong> {order.products.length} items</p>
                          <p><strong>Total:</strong> ₹{order.total_amount}</p>
                          {order.addresses && (
                            <p><strong>Address:</strong> {order.addresses.address_line}, {order.addresses.city}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Address Line"
                    value={newAddress.address_line}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                    <Input
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    />
                    <Input
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    />
                  </div>
                  <Button onClick={saveAddress}>
                    <Plus className="w-4 h-4 mr-2" />
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No addresses saved</p>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{address.address_line}</p>
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
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input value={user.email} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={user.phone || ''}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <Button onClick={updateProfile}>
                      Update Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                {user && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-lg">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-lg">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}