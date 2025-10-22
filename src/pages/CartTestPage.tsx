import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const CartTestPage = () => {
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { toast } = useToast();

  const testProduct = {
    id: "test-product-1",
    name: "Test T-Shirt",
    price: 49.99,
    size: "M",
    collection: "Test Collection",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    gsm: 180,
  };

  const handleAddTestItem = () => {
    addToCart(testProduct);
    toast({
      title: "Test item added",
      description: "Added test product to cart",
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart cleared",
      description: "All items removed from cart",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-2">Cart Test</h1>
          <p className="text-muted-foreground">Test cart functionality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Cart Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleAddTestItem} className="w-full btn-elegant">
                Add Test Item to Cart
              </Button>
              <Button onClick={handleClearCart} variant="destructive" className="w-full">
                Clear Cart
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/cart">View Cart Page</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/shop">Back to Shop</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cart Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="text-2xl font-bold">₹{totalPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cart Items</p>
                  {items.length === 0 ? (
                    <p className="text-muted-foreground">Cart is empty</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.size}`} className="p-2 bg-muted rounded">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.size} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            >
                              +
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => removeFromCart(item.id, item.size)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartTestPage;