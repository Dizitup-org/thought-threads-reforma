import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SaleBanner from "@/components/SaleBanner";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-elegant.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  collection: string;
  stock: number;
  sizes: string[];
  description?: string;
  featured: boolean;
  tags?: string[];
  discount_percentage?: number;
  discounted_price?: number;
  is_on_sale?: boolean;
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('products-home-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        fetchFeaturedProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  const transformProductForCard = (product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image_url || '',
    collection: product.collection,
    stock: product.stock,
    sizes: product.sizes,
    tags: product.tags,
    discount_percentage: product.discount_percentage,
    discounted_price: product.discounted_price,
    is_on_sale: product.is_on_sale
  });
  return <div className="min-h-screen">
      {/* Sale Banner */}
      <SaleBanner />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: `url(${heroImage})`
      }}>
          <div className="absolute inset-0 bg-background/20" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="serif-heading text-6xl md:text-8xl mb-8 animate-fade-in-up text-elegant font-extrabold">
            REFORMA
          </h1>
          
          <p className="text-2xl md:text-3xl text-primary mb-6 animate-fade-in-up [animation-delay:0.2s] font-light">
            Fashion. Reimagined.
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.4s] leading-relaxed">
            Minimalist elegance for deep thinkers. Where sophisticated design meets conscious choices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up [animation-delay:0.6s]">
            <Button asChild size="lg" className="btn-elegant px-8 py-4 text-base">
              <Link to="/shop">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-base">
              <Link to="/about">
                Our Philosophy
                <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-gentle-float">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 section-divider">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="serif-heading text-4xl md:text-5xl font-bold mb-6 text-elegant">
              New Arrivals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Thoughtfully crafted pieces that embody quiet luxury and conscious design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => <div key={product.id} className="animate-fade-in-up" style={{
            animationDelay: `${index * 0.15}s`
          }}>
                <ProductCard product={transformProductForCard(product)} />
              </div>)}
          </div>

          <div className="text-center mt-16">
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8">
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Threads of Thought Story */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="serif-heading text-4xl md:text-5xl font-bold mb-8 text-elegant">
              Threads of Thought
            </h2>
            <div className="prose prose-xl max-w-none text-muted-foreground leading-relaxed space-y-6">
              <p className="text-lg">
                In a world saturated with noise, we create for the quiet minds. The deep thinkers who find beauty in simplicity, meaning in minimalism, and truth in authentic expression.
              </p>
              <p className="text-lg">
                REFORMA represents the intersection of conscious design and sophisticated aesthetics. Each piece is thoughtfully crafted for those who understand that true luxury lies not in ostentation, but in the quiet confidence of knowing you've chosen well.
              </p>
              <p className="text-lg font-medium text-primary">
                Fashion. Reimagined for the thinking mind.
              </p>
            </div>
            
            <div className="mt-12">
              <Button asChild size="lg" className="btn-elegant px-8">
                <Link to="/about">
                  Discover Our Story
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-sage">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="serif-heading text-3xl md:text-4xl font-bold mb-6 text-elegant">
            Join the Thought Collective
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Be the first to discover new collections, exclusive insights, and the philosophy behind conscious fashion.
          </p>
          
          <div className="max-w-md mx-auto flex gap-3">
            <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
            <Button className="btn-elegant px-8 py-4">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>;
};
export default Home;