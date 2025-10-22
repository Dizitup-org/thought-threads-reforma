import { useState, useEffect } from 'react';
import { useCart } from "@/hooks/useCart";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import AddressSelector from '@/components/AddressSelector';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
      
      setUser(profile);
    }
  };

  const handleOrderViaWhatsApp = () => {
    if (!user) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    // Check if user has any addresses
    checkUserAddresses();
  };

  const checkUserAddresses = async () => {
    try {
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (addresses && addresses.length > 0) {
        setShowAddressSelector(true);
      } else {
        // Redirect to profile to add address
        toast({
          title: "No addresses found",
          description: "Please add a delivery address in your profile before placing an order.",
        });
        navigate('/profile?tab=addresses');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddressSelected = async (address: any) => {
    setSelectedAddress(address);
    setShowAddressSelector(false);
    
    try {
      // Save orders to Supabase (one row per item due to current schema)
      const orderPromises = items.map(async (item) => {
        const orderData = {
          user_id: user.id,
          address_id: address.id,
          product_name: item.name,
          collection: item.collection,
          size: item.size,
          products: {
            id: item.id,
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            collection: item.collection
          },
          total_amount: item.price * item.quantity,
          status: 'Pending'
        };

        return supabase.from('orders').insert(orderData);
      });

      const results = await Promise.all(orderPromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to save some orders');
      }

      // Generate WhatsApp message
      const message = `
🛍️ *New Order from Reforma Website*

*Customer Details:*
Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}

*Delivery Address:*
${address.address_line}
${address.city}, ${address.state} - ${address.pincode}
${address.country}

*Products:*
${items.map(item => `• ${item.name} (${item.size}) - Qty: ${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}

*Total Items:* ${totalItems}
*Total Amount:* ₹${totalPrice}

Order placed successfully! 🚀
      `.trim();

      const phoneNumber = "919831681756"; // Admin WhatsApp number
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Show success message
      toast({
        title: "You are a Reformer now! 🎉",
        description: "Thank you for placing the order. Your order has been placed successfully.",
        duration: 3000,
      });

      // Clear cart
      clearCart();
      
      // Redirect to WhatsApp
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-8">Your Cart</h1>
          <p className="text-muted-foreground mb-8">Your cart is empty</p>
          <Button asChild className="btn-elegant">
            <Link to="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="serif-heading text-4xl font-bold text-elegant mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.id}-${item.size}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.collection}</p>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="font-medium text-primary">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="serif-heading text-xl text-elegant">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items ({totalItems})</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  className="w-full btn-elegant" 
                  size="lg"
                  onClick={handleOrderViaWhatsApp}
                >
                  Order via WhatsApp
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/shop">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Address Selector Modal */}
      {user && (
        <AddressSelector
          isOpen={showAddressSelector}
          onClose={() => setShowAddressSelector(false)}
          onAddressSelected={handleAddressSelected}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default Cart;