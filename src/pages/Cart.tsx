import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  const generateWhatsAppMessage = () => {
    const orderDetails = items.map(item => 
      `${item.name} (${item.size}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const message = `Hi REFORMA, I'd like to order:\n\n${orderDetails}\n\nTotal: $${totalPrice.toFixed(2)}`;
    return `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
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
                      <p className="font-medium text-primary">${item.price.toFixed(2)}</p>
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
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button asChild className="w-full btn-elegant" size="lg">
                  <a href={generateWhatsAppMessage()} target="_blank" rel="noopener noreferrer">
                    Order via WhatsApp
                  </a>
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
    </div>
  );
};

export default Cart;