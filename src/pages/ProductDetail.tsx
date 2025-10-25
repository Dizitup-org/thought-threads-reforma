import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image_file_path?: string;
  collection: string;
  stock: number;
  sizes: string[];
  gsm?: number[];
  description?: string;
  featured: boolean;
  tags?: string[];
  discount_percentage?: number;
  discounted_price?: number;
  is_on_sale?: boolean;
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedGsm, setSelectedGsm] = useState<number | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProduct(data);
      
      // Parse images from image_file_path (comma-separated) or fallback to image_url
      const productImages = data.image_file_path 
        ? data.image_file_path.split(',').filter((img: string) => img.trim())
        : data.image_url ? [data.image_url] : [];
      
      setImages(productImages);
      
      // Set default GSM if available
      if (data.gsm && data.gsm.length > 0) {
        setSelectedGsm(data.gsm[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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

    if (product?.gsm && product.gsm.length > 0 && !selectedGsm) {
      toast({
        title: "Please select GSM",
        description: "Choose a GSM option before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: product!.id,
      name: product!.name,
      price: product!.is_on_sale && product!.discounted_price ? product!.discounted_price : product!.price,
      size: selectedSize,
      collection: product!.collection,
      image_url: images[0] || '',
      gsm: selectedGsm || undefined
    });

    toast({
      title: "Added to cart!",
      description: `${product!.name} (${selectedSize}${selectedGsm ? `, ${selectedGsm}gsm` : ''}) has been added to your cart.`,
    });
  };

  const generateWhatsAppMessage = () => {
    const message = `Hi REFORMA, I'd like to order ${product!.name} (${selectedSize || 'Size TBD'}${selectedGsm ? `, ${selectedGsm}gsm` : ''}) from ${product!.collection}. Price: ₹${product!.is_on_sale && product!.discounted_price ? product!.discounted_price : product!.price}`;
    return `https://wa.me/919831681756?text=${encodeURIComponent(message)}`;
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
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square group">
              <img
                src={images[currentImageIndex] || ''}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-elegant"
              />
              
              {/* Navigation arrows - only show if multiple images */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail strip - only show if multiple images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-reforma-brown' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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
              {product.is_on_sale ? (
                <div className="space-y-1">
                  <p className="text-xl line-through text-muted-foreground">₹{product.price}</p>
                  <p className="text-3xl font-bold text-destructive">₹{product.discounted_price}</p>
                  <Badge variant="destructive" className="text-sm">
                    {product.discount_percentage}% OFF
                  </Badge>
                </div>
              ) : (
                <p className="text-3xl font-bold text-primary">₹{product.price}</p>
              )}
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

            {/* GSM Selection */}
            {product.gsm && product.gsm.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Select GSM</h3>
                <div className="flex flex-wrap gap-2">
                  {product.gsm.map((gsm) => (
                    <Button
                      key={gsm}
                      variant={selectedGsm === gsm ? "default" : "outline"}
                      onClick={() => setSelectedGsm(gsm)}
                      className={selectedGsm === gsm ? "btn-elegant" : ""}
                    >
                      {gsm} GSM
                    </Button>
                  ))}
                </div>
              </div>
            )}

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
              <p>• Free shipping on orders over ₹5000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;