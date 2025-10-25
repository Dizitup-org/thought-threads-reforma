import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isAdminHovered, setIsAdminHovered] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
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
    <motion.div
      className="product-card group overflow-hidden h-full luxury-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsDetailsVisible(true)}
      onHoverEnd={() => setIsDetailsVisible(false)}
      onTap={() => setIsDetailsVisible(!isDetailsVisible)}
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0 relative">
          {/* Luxury Badge for Featured Products */}
          <AnimatePresence>
            {product.featured && (
              <motion.div
                className="absolute top-3 left-3 z-10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Badge className="bg-reforma-sage text-white border-0 px-3 py-1 text-xs font-medium luxury-badge shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative overflow-hidden">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-80 object-cover"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            
            {/* Hover Overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isAdminHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            ></motion.div>
            
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <Badge variant="secondary" className="bg-white/90 text-reforma-brown border-border/50 backdrop-blur-sm luxury-tag shadow-md">
                {product.collection}
              </Badge>
              {product.tags && product.tags.map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge 
                    className={`
                      funky-tag text-xs font-bold backdrop-blur-sm shadow-lg luxury-tag
                      ${tag === 'Sale' || tag === 'Discount' ? 'bg-destructive text-destructive-foreground' : 
                        tag === 'New Arrival' ? 'bg-green-500 text-white' :
                        tag === 'Winter Collection' ? 'bg-blue-500 text-white' :
                        tag === 'Limited Edition' ? 'bg-purple-500 text-white' :
                        'bg-reforma-sage text-white'}
                    `}
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 space-y-3 flex-col items-start bg-white/80 backdrop-blur-sm">
          {/* Price and Name - Always Visible */}
          <div className="w-full flex justify-between items-start">
            <motion.h3 
              className="serif-heading text-lg font-semibold text-reforma-brown luxury-product-name"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              {product.name}
            </motion.h3>
            <div className="text-right">
              {product.is_on_sale ? (
                <div className="space-y-0">
                  <motion.p 
                    className="text-sm line-through text-muted-foreground luxury-original-price"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                  >
                    ₹{product.price}
                  </motion.p>
                  <motion.p 
                    className="text-xl font-bold text-destructive luxury-sale-price"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                  >
                    ₹{product.discounted_price}
                  </motion.p>
                  <motion.p 
                    className="text-xs bg-destructive/10 text-destructive px-1 py-0.5 rounded-full luxury-discount-badge"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                  >
                    {product.discount_percentage}% OFF
                  </motion.p>
                </div>
              ) : (
                <motion.p 
                  className="text-xl font-bold text-reforma-brown luxury-price"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                >
                  ₹{product.price}
                </motion.p>
              )}
            </div>
          </div>

          {/* Additional Details - Revealed on Hover/Click */}
          <AnimatePresence>
            {isDetailsVisible && (
              <motion.div
                className="w-full space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="pt-2 border-t border-reforma-sage/20">
                  {/* Size Selection */}
                  <div className="mb-3">
                    <label className="text-xs text-reforma-brown/70 mb-1 block">Size</label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger className="w-full bg-input border-border luxury-select text-sm h-8">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map((size) => (
                          <SelectItem key={size} value={size} className="luxury-select-item text-sm">
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* GSM Selection (if available) */}
                  {product.gsm && product.gsm.length > 0 && (
                    <div className="mb-3">
                      <label className="text-xs text-reforma-brown/70 mb-1 block">GSM</label>
                      <Select value={selectedGsm.toString()} onValueChange={(value) => setSelectedGsm(Number(value))}>
                        <SelectTrigger className="w-full bg-input border-border luxury-select text-sm h-8">
                          <SelectValue placeholder="Select GSM" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.gsm.map((gsm) => (
                            <SelectItem key={gsm} value={gsm.toString()} className="luxury-select-item text-sm">
                              {gsm} GSM
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Button asChild variant="outline" className="luxury-btn-outline h-8 text-xs px-2">
                      <Link to={`/product/${product.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Link>
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      id={`add-to-cart-${product.id}`}
                      className="luxury-btn-primary h-8 text-xs px-2"
                      disabled={loading}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      {loading ? "..." : "Cart"}
                    </Button>
                    <Button
                      onClick={handleOrderNow}
                      id={`order-now-${product.id}`}
                      className="luxury-btn-accent h-8 text-xs px-2"
                      disabled={loading}
                    >
                      <MessageCircle className="mr-1 h-3 w-3" />
                      {loading ? "..." : "Order"}
                    </Button>
                  </div>
                </div>

                {product.stock <= 5 && product.stock > 0 && (
                  <motion.p 
                    className="text-xs text-destructive luxury-low-stock"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Only {product.stock} left in stock
                  </motion.p>
                )}
                {product.stock === 0 && (
                  <motion.p 
                    className="text-xs text-destructive font-semibold luxury-out-of-stock"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Out of Stock
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProductCard;