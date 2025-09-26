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
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }

    const message = `Hi Reforma, I'd like to order ${product.name} (${selectedSize}) from ${product.collection}.`;
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Card className="product-card group overflow-hidden h-full">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-card/90 text-primary border-border/50 backdrop-blur-sm">
              {product.collection}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 space-y-4 flex-col items-start">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="serif-heading text-xl font-semibold text-elegant">{product.name}</h3>
            <p className="text-2xl font-bold text-primary">${product.price}</p>
          </div>
          
          <div className="space-y-4">
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full bg-input border-border">
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
              <Button asChild variant="outline" className="flex-1">
                <Link to={`/product/${product.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              <Button
                onClick={handleWhatsAppOrder}
                className="flex-1 btn-elegant"
                disabled={!selectedSize || product.stock === 0}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Order
              </Button>
            </div>
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <p className="text-sm text-destructive">Only {product.stock} left in stock</p>
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