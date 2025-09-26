import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { getProducts } from "@/data/products";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");

  const product = getProducts().find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-4">Product Not Found</h1>
          <Button asChild className="btn-elegant">
            <Link to="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      collection: product.collection,
      image_url: product.image
    });

    toast({
      title: "Added to cart!",
      description: `${product.name} (${selectedSize}) has been added to your cart.`,
    });
  };

  const generateWhatsAppMessage = () => {
    const message = `Hi REFORMA, I'd like to order ${product.name} (${selectedSize || 'Size TBD'}) from ${product.collection}. Price: $${product.price}`;
    return `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg shadow-elegant"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="serif-heading text-4xl font-bold text-elegant">{product.name}</h1>
                {product.featured && (
                  <Badge variant="secondary" className="text-sm">Featured</Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-4">{product.collection}</p>
              <p className="text-3xl font-bold text-primary">${product.price}</p>
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={selectedSize === size ? "btn-elegant" : ""}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full btn-elegant" 
                  size="lg"
                  disabled={!selectedSize}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                
                <Button asChild variant="outline" className="w-full" size="lg">
                  <a href={generateWhatsAppMessage()} target="_blank" rel="noopener noreferrer">
                    Order via WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
              <p>• Premium quality materials</p>
              <p>• Sustainable production</p>
              <p>• Free shipping on orders over $100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;