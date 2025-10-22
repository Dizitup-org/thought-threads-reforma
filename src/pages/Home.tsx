import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SaleBanner from "@/components/SaleBanner";
import { supabase } from "@/integrations/supabase/client";
// Using the new hero image with the REFORMA t-shirt
import heroImage from "@/assets/reforma-tshirt-hero.jpg";

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
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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

    // Set up intersection observer for animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observerRef.current.observe(heroRef.current);
    }

    return () => {
      supabase.removeChannel(channel);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
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

  return (
    <div className="min-h-screen">
      {/* Sale Banner */}
      <SaleBanner />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden hero-section"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: `url(${heroImage})`,
            transform: isVisible ? 'scale(1)' : 'scale(1.1)',
            opacity: isVisible ? 1 : 0,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="hero-overlay"></div>
        </div>
      
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="serif-heading text-5xl md:text-7xl lg:text-8xl mb-6 animate-fade-in-up text-elegant font-extrabold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            REFORMA
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-foreground mb-6 animate-fade-in-up [animation-delay:0.2s] font-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Fashion. Reimagined.
          </p>
          
          <p className="text-lg md:text-xl text-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up [animation-delay:0.4s] leading-relaxed font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
            Minimalist elegance for deep thinkers. Where sophisticated design meets conscious choices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up [animation-delay:0.6s]">
            <Button asChild size="lg" className="btn-elegant px-8 py-4 text-base transition-all duration-300 hover:shadow-lg backdrop-blur-sm bg-accent/90">
              <Link to="/shop">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-base transition-all duration-300 hover:shadow-lg bg-card/80 backdrop-blur-sm">
              <Link to="/about">
                Our Philosophy
                <Sparkles className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
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
      <section className="py-20 md:py-24 section-divider">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="serif-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-elegant">
              New Arrivals
            </h2>
            <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto leading-relaxed">
              Thoughtfully crafted pieces that embody quiet luxury and conscious design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={`animate-fade-in-up fade-in ${isVisible ? 'visible' : ''}`}
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <ProductCard product={transformProductForCard(product)} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 md:mt-16">
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 transition-all duration-300 hover:scale-105">
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Threads of Thought Story */}
      <section className="py-20 md:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="serif-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-elegant">
              Threads of Thought
            </h2>
            <div className="prose prose-xl max-w-none text-foreground leading-relaxed space-y-6">
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
            
            <div className="mt-10 md:mt-12">
              <Button asChild size="lg" className="btn-elegant px-8 transition-all duration-300 hover:scale-105">
                <Link to="/about">
                  Discover Our Story
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 md:py-24 bg-gradient-sage">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="serif-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-elegant">
            Join the Thought Collective
          </h2>
          <p className="text-lg text-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            Be the first to discover new collections, exclusive insights, and the philosophy behind conscious fashion.
          </p>
          
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-300 input-elegant" 
            />
            <Button className="btn-elegant px-8 py-4 transition-all duration-300 hover:scale-105">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;