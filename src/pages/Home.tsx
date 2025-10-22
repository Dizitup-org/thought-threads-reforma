import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SaleBanner from "@/components/SaleBanner";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
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
  created_at?: string;
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchLatestProducts();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('products-home-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        fetchFeaturedProducts();
        fetchLatestProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Add scroll event listener for animations
    const handleScroll = () => {
      const elements = document.querySelectorAll('.scroll-fade-in');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on initial load

    return () => window.removeEventListener('scroll', handleScroll);
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

  const fetchLatestProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setLatestProducts(data || []);
    } catch (error) {
      console.error('Error fetching latest products:', error);
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
    gsm: product.gsm,
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
      <section className="relative h-screen flex items-center justify-center overflow-hidden luxury-section">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`
          }}
        >
          {/* Semi-transparent overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/40" />
        </div>
        
        {/* Luxury Brand Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="luxury-animation-container opacity-20">
            <div className="luxury-circle luxury-circle-1"></div>
            <div className="luxury-circle luxury-circle-2"></div>
            <div className="luxury-circle luxury-circle-3"></div>
          </div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 mobile-padding">
          <h1 className="serif-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 sm:mb-8 animate-luxury-scale-in text-reforma-brown font-extrabold luxury-heading">
            RĒFORMA
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl text-reforma-brown mb-6 animate-luxury-fade-in animate-stagger-1 font-light">
            Fashion. Reimagined.
          </p>
          
          <p className="text-base sm:text-lg md:text-xl text-reforma-brown/80 mb-8 sm:mb-12 max-w-2xl mx-auto animate-luxury-fade-in animate-stagger-2 leading-relaxed">
            Minimalist elegance for deep thinkers. Where sophisticated design meets conscious choices.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-luxury-fade-in animate-stagger-3">
            <Button asChild size="lg" className="luxury-btn-primary px-6 py-3 sm:px-8 sm:py-4 text-base touch-friendly">
              <Link to="/shop">
                Explore Collection
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="luxury-btn-outline px-6 py-3 sm:px-8 sm:py-4 text-base touch-friendly">
              <Link to="/about">
                Our Philosophy
                <Sparkles className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-gentle-float">
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-reforma-brown rounded-full flex justify-center">
            <div className="w-1 h-2 sm:w-1 sm:h-3 bg-reforma-brown rounded-full mt-1 sm:mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 sm:py-20 md:py-24 luxury-section-divider scroll-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-reforma-brown luxury-heading">
              Featured Collections
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Curated pieces that embody our signature aesthetic and craftsmanship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-luxury-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <ProductCard product={transformProductForCard(product)} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <Button asChild size="lg" className="luxury-btn-outline px-6 sm:px-8 touch-friendly">
              <Link to="/shop?featured=true">
                View All Featured
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Uploads */}
      <section className="py-16 sm:py-20 md:py-24 bg-card scroll-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-reforma-brown luxury-heading">
              Latest Uploads
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Fresh additions to our collection, crafted with attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {latestProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-luxury-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <ProductCard product={transformProductForCard(product)} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <Button asChild size="lg" className="luxury-btn-primary px-6 sm:px-8 touch-friendly">
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Threads of Thought Story */}
      <section className="py-16 sm:py-20 md:py-24 luxury-section scroll-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-reforma-brown luxury-heading">
              Threads of Thought
            </h2>
            <div className="prose prose-xl max-w-none text-muted-foreground leading-relaxed space-y-4 sm:space-y-6">
              <p className="text-base sm:text-lg">
                In a world saturated with noise, we create for the quiet minds. The deep thinkers who find beauty in simplicity, meaning in minimalism, and truth in authentic expression.
              </p>
              <p className="text-base sm:text-lg">
                RĒFORMA represents the intersection of conscious design and sophisticated aesthetics. Each piece is thoughtfully crafted for those who understand that true luxury lies not in ostentation, but in the quiet confidence of knowing you've chosen well.
              </p>
              <p className="text-base sm:text-lg font-medium text-reforma-brown">
                Fashion. Reimagined for the thinking mind.
              </p>
            </div>
            
            <div className="mt-8 sm:mt-12">
              <Button asChild size="lg" className="luxury-btn-primary px-6 sm:px-8 touch-friendly">
                <Link to="/about">
                  Discover Our Story
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-sage luxury-section scroll-fade-in">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="serif-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-reforma-brown luxury-heading">
            Join the Thought Collective
          </h2>
          <p className="text-base sm:text-lg text-reforma-brown/80 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Be the first to discover new collections, exclusive insights, and the philosophy behind conscious fashion.
          </p>
          
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-reforma-sage text-foreground luxury-input" 
            />
            <Button className="luxury-btn-primary px-6 py-3 sm:px-8 sm:py-4 touch-friendly">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;