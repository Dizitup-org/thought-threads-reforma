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
import { MessageCircle, Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  collection: string;
  stock: number;
  sizes: string[];
  gsm?: number;
  tags?: string[];
  discount_percentage?: number;
  discounted_price?: number;
  is_on_sale?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localProduct, setLocalProduct] = useState<Product>(product);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Update local product when the prop changes (for real-time updates)
  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  // Set up real-time subscription for this specific product
  useEffect(() => {
    const channel = supabase
      .channel(`product-${product.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        filter: `id=eq.${product.id}`
      }, (payload) => {
        console.log(`Real-time update for product ${product.id}:`, payload);
        // Update the local product state with the new data
        setLocalProduct(prev => ({
          ...prev,
          ...payload.new
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    const price = localProduct.is_on_sale && localProduct.discounted_price ? localProduct.discounted_price : localProduct.price;
    
    addToCart({
      id: localProduct.id,
      name: localProduct.name,
      price: price,
      size: selectedSize,
      collection: localProduct.collection,
      image_url: localProduct.image,
      gsm: localProduct.gsm || 180
    });

    toast({
      title: "Added to cart!",
      description: `${localProduct.name} (${selectedSize}, ${localProduct.gsm || 180} GSM) has been added to your cart.`,
    });
  };

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before ordering via WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    const price = localProduct.is_on_sale && localProduct.discounted_price ? localProduct.discounted_price : localProduct.price;
    const message = `Hi Reforma, I'd like to order ${localProduct.name} (${selectedSize}, ${localProduct.gsm || 180} GSM) from ${localProduct.collection}. Price: ₹${price}`;
    const whatsappUrl = `https://wa.me/919831681756?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Card className="product-card group overflow-hidden h-full card-hover">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-80 bg-muted animate-pulse" />
          )}
          <img
            src={localProduct.image}
            alt={localProduct.name}
            className={`w-full h-80 object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            } group-hover:scale-110`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-card/90 text-primary border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              {localProduct.collection}
            </Badge>
            {localProduct.tags && localProduct.tags.map(tag => (
              <Badge 
                key={tag} 
                className={`
                  funky-tag text-xs font-bold backdrop-blur-sm transform transition-all duration-300 hover:scale-105
                  ${tag === 'Sale' || tag === 'Discount' ? 'bg-destructive text-destructive-foreground' : 
                    tag === 'New Arrival' ? 'bg-green-500 text-white' :
                    tag === 'Winter Collection' ? 'bg-blue-500 text-white' :
                    tag === 'Limited Edition' ? 'bg-purple-500 text-white' :
                    'bg-orange-500 text-white'}
                `}
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          {/* Quick view button */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Button asChild variant="outline" className="bg-white/90 hover:bg-white transition-all duration-300 hover:scale-105">
              <Link to={`/product/${localProduct.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Quick View
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 space-y-4 flex-col items-start">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="serif-heading text-xl font-semibold text-elegant group-hover:text-accent transition-colors duration-300">
              {localProduct.name}
            </h3>
            <div className="text-right">
              {localProduct.is_on_sale ? (
                <div className="space-y-1">
                  <p className="text-lg line-through text-muted-foreground">₹{localProduct.price}</p>
                  <p className="text-2xl font-bold text-destructive">₹{localProduct.discounted_price}</p>
                  <p className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full transition-all duration-300 hover:scale-105">
                    {localProduct.discount_percentage}% OFF
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-primary">₹{localProduct.price}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full bg-input border-border focus:ring-2 focus:ring-accent transition-all duration-300">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {localProduct.sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedSize && (
                <p className="text-xs text-muted-foreground">Please select a size to add to cart</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAddToCart}
                className={`flex-1 btn-elegant transition-all duration-300 hover:scale-105 ${(!selectedSize || localProduct.stock === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedSize || localProduct.stock === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                onClick={handleWhatsAppOrder}
                className={`flex-1 transition-all duration-300 hover:scale-105 ${(!selectedSize || localProduct.stock === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                variant="outline"
                disabled={!selectedSize || localProduct.stock === 0}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Order Now
              </Button>
            </div>

          </div>

          {localProduct.stock <= 5 && localProduct.stock > 0 && (
            <p className="text-sm text-destructive animate-pulse-subtle">Only {localProduct.stock} left in stock</p>
          )}
          {localProduct.stock === 0 && (
            <p className="text-sm text-destructive font-semibold">Out of Stock</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;