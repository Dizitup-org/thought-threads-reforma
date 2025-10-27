import { useState, useEffect } from 'react';
import { useCart } from "@/hooks/useCart";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, ArrowLeft, QrCode, Timer, User, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import AddressSelector from '@/components/AddressSelector';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [adminPhoneNumber, setAdminPhoneNumber] = useState("919831681756");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Customer details form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Check authentication and load user
  useEffect(() => {
    checkAuthStatus();
    loadAdminSettings();
    
    // Load user data from welcome animation if available
    const userData = localStorage.getItem('reforma_user_data');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setCustomerName(parsedData.name || "");
        setCustomerEmail(parsedData.email || "");
        setCustomerPhone(parsedData.phone || "");
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const loadAdminSettings = async () => {
    try {
      // Load admin settings from environment or database
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['admin_phone', 'whatsapp_message_template']);
      
      if (!error && data) {
        const phoneSetting = data.find(setting => setting.setting_key === 'admin_phone');
        if (phoneSetting) {
          setAdminPhoneNumber(phoneSetting.setting_value);
        }
      }
    } catch (error) {
      console.log('Could not load admin settings, using defaults');
    }
  };

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

  const handlePlaceOrder = () => {
    // Show customer details form first
    setShowCustomerForm(true);
  };

  const handleCustomerFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all customer details.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.replace(/[^0-9]/g, ''))) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setShowCustomerForm(false);
    setShowPaymentQR(true);
  };

  const handleAddressSelected = async (address: any) => {
    setSelectedAddress(address);
    setShowAddressSelector(false);
    
    // Instead of saving to database immediately, show payment QR
    setShowPaymentQR(true);
  };

  const handleIHavePaid = async () => {
    setLoading(true);
    try {
      // Save orders to database with user_id for proper syncing
      const orderPromises = items.map(item => {
        const orderData = {
          user_id: user?.id || null,
          product_id: item.id,
          product_name: item.name,
          size: item.size,
          gsm: item.gsm,
          collection: item.collection,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          total_amount: item.price * item.quantity,
          status: 'Pending'
        };

        return supabase.from('orders').insert(orderData);
      });

      // Execute all order insertions (non-blocking)
      Promise.all(orderPromises)
        .then(results => {
          const errors = results.filter(result => result.error);
          if (errors.length > 0) {
            console.error('Some orders failed to save to database:', errors);
          }
        })
        .catch(error => {
          console.error('Error saving orders to database:', error);
        });

      // Generate comprehensive WhatsApp message with customer details
      const message = `Hey RēForma Team 👋,

I've just completed payment for my order!

*Customer Details:*
Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}

*Order Summary:*
${items.map(item => `• ${item.name} (${item.size}${item.gsm ? `, ${item.gsm}gsm` : ''}) x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

*Total Amount Paid: ₹${totalPrice.toFixed(2)}*

Please confirm my order and share the expected delivery details. When can I expect my order to arrive?

Thank you!`;

      const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Show success message and redirect to WhatsApp
      toast({
        title: "Order placed successfully!",
        description: "Redirecting to WhatsApp for confirmation.",
        duration: 3000,
      });

      // Clear cart
      clearCart();
      setOrderPlaced(true);
      setShowPaymentQR(false);
      
      // Redirect to WhatsApp (this will always happen regardless of database errors)
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message || "An unexpected error occurred. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-8">Your Cart</h1>
          <p className="text-muted-foreground mb-8">Your cart is empty</p>
          <Button asChild className="btn-reforma">
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
        <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.id}-${item.size}-${item.gsm || 0}`}>
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
                      <h3 className="font-semibold text-reforma-brown">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.collection}</p>
                      <p className="text-sm text-muted-foreground">Size: {item.size}{item.gsm && `, ${item.gsm}gsm`}</p>
                      <p className="font-medium text-reforma-brown">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.size, item.gsm, item.quantity - 1)}
                        className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.size, item.gsm, item.quantity + 1)}
                        className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFromCart(item.id, item.size, item.gsm)}
                        className="text-destructive border-destructive hover:bg-destructive/10"
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
                <CardTitle className="serif-heading text-xl text-reforma-brown">Order Summary</CardTitle>
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
                  className="w-full btn-reforma" 
                  size="lg"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
                <Button asChild variant="outline" className="w-full border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5">
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

      {/* Customer Details Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="serif-heading text-xl text-reforma-brown">Customer Details</CardTitle>
              <p className="text-sm text-muted-foreground">Please provide your contact information to proceed</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomerFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-reforma"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="input-reforma"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input-reforma"
                    required
                  />
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    type="submit"
                    className="btn-reforma w-full"
                  >
                    Continue to Payment
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                    onClick={() => setShowCustomerForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment QR Modal */}
      {showPaymentQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="serif-heading text-xl text-reforma-brown">Complete Payment</CardTitle>
              <p className="text-sm text-muted-foreground">Customer: {customerName} | {customerEmail}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">Scan to Pay via PhonePe or GPay</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Timer className="h-4 w-4 mr-1" />
                    <CountdownTimer initialMinutes={3} onTimeout={() => setShowPaymentQR(false)} />
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg inline-block">
                  {/* QR Code Image */}
                  <div className="bg-white p-2 rounded">
                    <img 
                      src="https://i.ibb.co/tTRQTt4C/qr-code-placeholder.png" 
                      alt="Payment QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">UPI ID: reforma@upi</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  className="btn-reforma w-full"
                  onClick={handleIHavePaid}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "I've Paid"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-reforma-brown text-reforma-brown hover:bg-reforma-brown/5"
                  onClick={() => setShowPaymentQR(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

const CountdownTimer = ({ initialMinutes, onTimeout }: { initialMinutes: number; onTimeout: () => void }) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev === 0) {
          if (minutes === 0) {
            clearInterval(timer);
            onTimeout();
            return 0;
          }
          setMinutes(prevMinutes => prevMinutes - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, onTimeout]);

  return (
    <span>
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
};
