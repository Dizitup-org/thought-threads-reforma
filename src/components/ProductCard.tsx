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
import { MessageCircle } from "lucide-react";

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
    <Card className="product-card group overflow-hidden">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {product.collection}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 space-y-4">
        <div className="w-full space-y-2">
          <h3 className="font-heading text-lg font-semibold">{product.name}</h3>
          <p className="text-2xl font-bold text-primary">${product.price}</p>
          
          <div className="space-y-3">
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full">
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

            <Button
              onClick={handleWhatsAppOrder}
              className="w-full btn-hero text-accent-foreground font-semibold"
              disabled={!selectedSize || product.stock === 0}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Order via WhatsApp
            </Button>
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