import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Eye, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  collection: string;
  stock: number;
  sizes: string[];
  gsm?: number[];
  tags?: string[];
  discount_percentage?: number;
  discounted_price?: number;
  is_on_sale?: boolean;
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedGsm, setSelectedGsm] = useState<number>(product.gsm?.[0] || 180);
  const { addToCart } = useCart();
  const [adminPhoneNumber, setAdminPhoneNumber] = useState("919831681756");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load admin settings
    const loadAdminSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'admin_phone')
          .single();
        
        if (!error && data) {
          setAdminPhoneNumber(data.setting_value);
        }
      } catch (error) {
        console.log('Could not load admin settings, using default');
      }
    };
    
    loadAdminSettings();
  }, []);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }

    if (!selectedGsm && product.gsm) {
      alert("Please select a GSM option");
      return;
    }

    setLoading(true);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.is_on_sale && product.discounted_price ? product.discounted_price : product.price,
      size: selectedSize,
      collection: product.collection,
      image_url: product.image,
      gsm: selectedGsm
    });

    // Show success feedback
    const addToCartButton = document.getElementById(`add-to-cart-${product.id}`);
    if (addToCartButton) {
      const originalText = addToCartButton.textContent;
      addToCartButton.textContent = "Added!";
      addToCartButton.classList.add("bg-green-500");
      setTimeout(() => {
        if (addToCartButton) {
          addToCartButton.textContent = originalText;
          addToCartButton.classList.remove("bg-green-500");
        }
      }, 1500);
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const handleOrderNow = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }

    if (!selectedGsm && product.gsm) {
      alert("Please select a GSM option");
      return;
    }

    // Instead of directly opening WhatsApp, add to cart and go to cart page
    addToCart({
      id: product.id,
      name: product.name,
      price: product.is_on_sale && product.discounted_price ? product.discounted_price : product.price,
      size: selectedSize,
      collection: product.collection,
      image_url: product.image,
      gsm: selectedGsm
    });

    // Show success feedback
    const orderButton = document.getElementById(`order-now-${product.id}`);
    if (orderButton) {
      const originalText = orderButton.textContent;
      orderButton.textContent = "Added to Cart!";
      orderButton.classList.add("bg-green-500");
      setTimeout(() => {
        if (orderButton) {
          orderButton.textContent = originalText;
          orderButton.classList.remove("bg-green-500");
        }
      }, 1500);
    }

    // Redirect to cart page after a short delay
    setTimeout(() => {
      window.location.href = '/cart';
    }, 1500);
  };

  return (
    <Card className="product-card group overflow-hidden h-full luxury-card">
      <CardContent className="p-0 relative">
        {/* Luxury Badge for Featured Products */}
        {product.featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-reforma-sage text-white border-0 px-3 py-1 text-xs font-medium luxury-badge">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          </div>
        )}
        
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700 luxury-image"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <Badge variant="secondary" className="bg-white/90 text-reforma-brown border-border/50 backdrop-blur-sm luxury-tag">
              {product.collection}
            </Badge>
            {product.tags && product.tags.map(tag => (
              <Badge 
                key={tag} 
                className={`
                  funky-tag text-xs font-bold backdrop-blur-sm transform -rotate-2 shadow-lg luxury-tag
                  ${tag === 'Sale' || tag === 'Discount' ? 'bg-destructive text-destructive-foreground' : 
                    tag === 'New Arrival' ? 'bg-green-500 text-white' :
                    tag === 'Winter Collection' ? 'bg-blue-500 text-white' :
                    tag === 'Limited Edition' ? 'bg-purple-500 text-white' :
                    'bg-reforma-sage text-white'}
                `}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 space-y-4 flex-col items-start luxury-card-footer">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="serif-heading text-xl font-semibold text-reforma-brown luxury-product-name">{product.name}</h3>
            <div className="text-right">
              {product.is_on_sale ? (
                <div className="space-y-1">
                  <p className="text-lg line-through text-muted-foreground luxury-original-price">₹{product.price}</p>
                  <p className="text-2xl font-bold text-destructive luxury-sale-price">₹{product.discounted_price}</p>
                  <p className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full luxury-discount-badge">
                    {product.discount_percentage}% OFF
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-reforma-brown luxury-price">₹{product.price}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Size Selection */}
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full bg-input border-border luxury-select">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {product.sizes.map((size) => (
                  <SelectItem key={size} value={size} className="luxury-select-item">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* GSM Selection (if available) */}
            {product.gsm && product.gsm.length > 0 && (
              <Select value={selectedGsm.toString()} onValueChange={(value) => setSelectedGsm(Number(value))}>
                <SelectTrigger className="w-full bg-input border-border luxury-select">
                  <SelectValue placeholder="Select GSM" />
                </SelectTrigger>
                <SelectContent>
                  {product.gsm.map((gsm) => (
                    <SelectItem key={gsm} value={gsm.toString()} className="luxury-select-item">
                      {gsm} GSM
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button asChild variant="outline" className="luxury-btn-outline">
                <Link to={`/product/${product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
              <Button
                onClick={handleAddToCart}
                id={`add-to-cart-${product.id}`}
                className="luxury-btn-primary"
                disabled={loading}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {loading ? "Adding..." : "Cart"}
              </Button>
              <Button
                onClick={handleOrderNow}
                id={`order-now-${product.id}`}
                className="luxury-btn-accent"
                disabled={loading}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {loading ? "Adding..." : "Order"}
              </Button>

            </div>
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-destructive luxury-low-stock">Only {product.stock} left in stock</p>
          )}
          {product.stock === 0 && (
            <p className="text-sm text-destructive font-semibold luxury-out-of-stock">Out of Stock</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;