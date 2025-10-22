import { useState } from "react";
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
import { MessageCircle, Eye } from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  collection: string;
  stock: number;
  sizes: string[];
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

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }

    const message = `Hi Reforma, I'd like to order ${product.name} (${selectedSize}) from ${product.collection}.`;
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
            src={product.image}
            alt={product.name}
            className={`w-full h-80 object-cover transition-all duration-700 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            } group-hover:scale-110`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-card/90 text-primary border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105">
              {product.collection}
            </Badge>
            {product.tags && product.tags.map(tag => (
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
              <Link to={`/product/${product.id}`}>
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
              {product.name}
            </h3>
            <div className="text-right">
              {product.is_on_sale ? (
                <div className="space-y-1">
                  <p className="text-lg line-through text-muted-foreground">₹{product.price}</p>
                  <p className="text-2xl font-bold text-destructive">₹{product.discounted_price}</p>
                  <p className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full transition-all duration-300 hover:scale-105">
                    {product.discount_percentage}% OFF
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-primary">₹{product.price}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full bg-input border-border focus:ring-2 focus:ring-accent transition-all duration-300">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {product.sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1 transition-all duration-300 hover:scale-105">
                <Link to={`/product/${product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              <Button
                onClick={handleWhatsAppOrder}
                className="flex-1 btn-elegant transition-all duration-300 hover:scale-105"
                disabled={!selectedSize || product.stock === 0}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Order
              </Button>
            </div>
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-destructive animate-pulse-subtle">Only {product.stock} left in stock</p>
          )}
          {product.stock === 0 && (
            <p className="text-sm text-destructive font-semibold">Out of Stock</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;