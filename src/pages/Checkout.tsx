import { useState, useEffect } from 'react';
import { useCart } from "@/hooks/useCart";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, QrCode } from "lucide-react";
import AddressSelector from '@/components/AddressSelector';
import { Link } from 'react-router-dom';
import QRCode from "react-qr-code";

const Checkout = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [whatsappRedirecting, setWhatsappRedirecting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    checkAuthStatus();
  }, [items, navigate]);

  const checkAuthStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
      
      setUser(profile);
    } else {
      navigate('/auth');
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
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

      setOrderPlaced(true);
      
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePaymentConfirmation = () => {
    setWhatsappRedirecting(true);
    
    // Generate WhatsApp message
    const message = `
🛍️ *New Order from Reforma Website*

*Customer Details:*
Name: ${user?.name || 'N/A'}
Email: ${user?.email || 'N/A'}
Phone: ${user?.phone || 'Not provided'}

*Delivery Address:*
${selectedAddress?.address_line || 'N/A'}
${selectedAddress?.city || 'N/A'}, ${selectedAddress?.state || 'N/A'} - ${selectedAddress?.pincode || 'N/A'}
${selectedAddress?.country || 'India'}

*Products:*
${items.map(item => `• ${item.name} (Size: ${item.size}, GSM: ${item.gsm || 180}) - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

*Total Items:* ${totalItems}
*Total Amount:* ₹${totalPrice.toFixed(2)}
*Payment:* Done via GPay QR

Hello Reforma Team 👋,
I've just placed an order from your website.
Order Details:
- Product(s): ${items.map(item => `${item.name} (Size: ${item.size}, GSM: ${item.gsm || 180}) - Qty: ${item.quantity}`).join(', ')}
- Total Amount: ₹${totalPrice.toFixed(2)}
- Payment: Done via GPay QR

Please confirm my order and provide estimated delivery date. Thank you!
    `.trim();

    // Use the provided QR code link
    const qrCodeUrl = "https://ibb.co/pjspJh6P";
    
    // Show success message
    toast({
      title: "Redirecting to QR Code",
      description: "You'll be redirected to the payment QR code.",
      duration: 3000,
    });

    // Clear cart
    clearCart();
    
    // Redirect to QR code after a short delay
    setTimeout(() => {
      window.open(qrCodeUrl, '_blank');
      navigate('/shop');
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-8">Checkout</h1>
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

  // Generate UPI payment URL for QR code
  const upiPaymentUrl = `upi://pay?pa=reforma@oksbi&pn=REFORMA&am=${totalPrice}&cu=INR&tn=Order from Reforma`;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <h1 className="serif-heading text-4xl font-bold text-elegant mb-8">Checkout</h1>
        
        {orderPlaced ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="serif-heading text-3xl font-bold text-elegant mb-4">Order Placed Successfully!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Please scan the QR code below to complete your payment of ₹{totalPrice.toFixed(2)}
            </p>
            
            <Card className="max-w-md mx-auto mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <QrCode className="mr-2 h-6 w-6" />
                  Payment QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode 
                    value={upiPaymentUrl}
                    size={192}
                    level="H"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Scan this QR code to complete your payment securely via GPay.
                </p>
                <p className="text-lg font-semibold text-primary mt-4">
                  Amount: ₹{totalPrice.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handlePaymentConfirmation}
                className="btn-elegant"
                disabled={whatsappRedirecting}
              >
                {whatsappRedirecting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Redirecting...
                  </>
                ) : (
                  "I've Paid - Confirm Order"
                )}
              </Button>
              <Button asChild variant="outline">
                <Link to="/cart">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cart
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-elegant">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAddress ? (
                    <div className="space-y-2">
                      <p className="font-medium">{user?.name}</p>
                      <p>{selectedAddress.address_line}</p>
                      <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <p>{selectedAddress.country}</p>
                      {user?.phone && <p>Phone: {user.phone}</p>}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowAddressSelector(true)}
                        className="mt-2"
                      >
                        Change Address
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowAddressSelector(true)} className="btn-elegant">
                      Select Delivery Address
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-elegant">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex justify-between border-b pb-3">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Size: {item.size}, GSM: {item.gsm || 180} × {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-lg pt-3">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="serif-heading text-xl text-elegant">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-elegant mt-4" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={!selectedAddress}
                  >
                    Place Order
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/cart">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Cart
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
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

export default Checkout;