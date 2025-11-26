import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  return (
    <motion.div
      className="product-card group overflow-hidden h-full luxury-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        <Card className="h-full overflow-hidden border-0 shadow-lg">
          <CardContent className="p-0 relative">
            {/* Luxury Badge for Featured Products */}
            {product.featured && (
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-reforma-sage text-white border-0 px-3 py-1 text-xs font-medium luxury-badge shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}
            
            <div className="relative overflow-hidden">
              <motion.img
                src={product.image}
                alt={product.name}
                className="w-full h-80 object-cover"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <Badge variant="secondary" className="bg-white/90 text-reforma-brown border-border/50 backdrop-blur-sm luxury-tag shadow-md">
                  {product.collection}
                </Badge>
                {product.tags && product.tags.map((tag, index) => (
                  <div key={tag}>
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
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 space-y-3 flex-col items-start bg-white/80 backdrop-blur-sm">
            {/* Price and Name - Always Visible */}
            <div className="w-full flex justify-between items-start">
              <h3 className="serif-heading text-lg font-semibold text-reforma-brown luxury-product-name">
                {product.name}
              </h3>
              <div className="text-right">
                {product.is_on_sale ? (
                  <div className="space-y-0">
                    <p className="text-sm line-through text-muted-foreground luxury-original-price">
                      ₹{product.price}
                    </p>
                    <p className="text-xl font-bold text-destructive luxury-sale-price">
                      ₹{product.discounted_price}
                    </p>
                    <p className="text-xs bg-destructive/10 text-destructive px-1 py-0.5 rounded-full luxury-discount-badge">
                      {product.discount_percentage}% OFF
                    </p>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-reforma-brown luxury-price">
                    ₹{product.price}
                  </p>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProductCard;