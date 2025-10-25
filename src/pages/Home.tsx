import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SaleBanner from "@/components/SaleBanner";
import NewsletterForm from "@/components/NewsletterForm";
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
      }, (payload) => {
        console.log('Home page: Real-time product change detected:', payload);
        fetchFeaturedProducts();
        fetchLatestProducts();
      })
      .subscribe((status) => {
        console.log('Home page: Products channel status:', status);
      });

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
    is_on_sale: product.is_on_sale,
    featured: product.featured
  });

  return (
    <div className="min-h-screen">
      {/* Sale Banner */}
      <SaleBanner />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden luxury-section">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Semi-transparent overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background/40" />
        </motion.div>
        
        {/* Luxury Brand Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="luxury-animation-container opacity-20">
            <motion.div 
              className="luxury-circle luxury-circle-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <motion.div 
              className="luxury-circle luxury-circle-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <motion.div 
              className="luxury-circle luxury-circle-3"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            ></motion.div>
          </div>
        </div>
        
        <motion.div 
          className="relative z-10 text-center max-w-4xl mx-auto px-4 mobile-padding"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h1 
            className="serif-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 sm:mb-8 text-reforma-brown font-extrabold luxury-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            RĒFORMA
          </motion.h1>
          
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl text-reforma-brown mb-6 animate-luxury-fade-in animate-stagger-1 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Fashion. Reimagined.
          </motion.p>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-reforma-brown/80 mb-8 sm:mb-12 max-w-2xl mx-auto animate-luxury-fade-in animate-stagger-2 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Minimalist elegance for deep thinkers. Where sophisticated design meets conscious choices.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-luxury-fade-in animate-stagger-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
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
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.div 
            className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-reforma-brown rounded-full flex justify-center"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-1 h-2 sm:w-1 sm:h-3 bg-reforma-brown rounded-full mt-1 sm:mt-2"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Collections */}
      <motion.section 
        className="py-16 sm:py-20 md:py-24 luxury-section-divider scroll-fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-reforma-brown luxury-heading">
              Featured Collections
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Curated pieces that embody our signature aesthetic and craftsmanship.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <ProductCard product={transformProductForCard(product)} />
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12 sm:mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Button asChild size="lg" className="luxury-btn-outline px-6 sm:px-8 touch-friendly">
              <Link to="/shop?featured=true">
                View All Featured
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Latest Uploads */}
      <motion.section 
        className="py-16 sm:py-20 md:py-24 bg-card scroll-fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-reforma-brown luxury-heading">
              Latest Uploads
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Fresh additions to our collection, crafted with attention to detail.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {latestProducts.map((product, index) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <ProductCard product={transformProductForCard(product)} />
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12 sm:mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Button asChild size="lg" className="luxury-btn-primary px-6 sm:px-8 touch-friendly">
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Threads of Thought Story */}
      <motion.section 
        className="py-16 sm:py-20 md:py-24 luxury-section scroll-fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-reforma-brown luxury-heading">
              Threads of Thought
            </h2>
            <div className="prose prose-xl max-w-none text-muted-foreground leading-relaxed space-y-4 sm:space-y-6">
              <motion.p 
                className="text-base sm:text-lg"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                In a world saturated with noise, we create for the quiet minds. The deep thinkers who find beauty in simplicity, meaning in minimalism, and truth in authentic expression.
              </motion.p>
              <motion.p 
                className="text-base sm:text-lg"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                RĒFORMA represents the intersection of conscious design and sophisticated aesthetics. Each piece is thoughtfully crafted for those who understand that true luxury lies not in ostentation, but in the quiet confidence of knowing you've chosen well.
              </motion.p>
              <motion.p 
                className="text-base sm:text-lg font-medium text-reforma-brown"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                Fashion. Reimagined for the thinking mind.
              </motion.p>
            </div>
            
            <motion.div 
              className="mt-8 sm:mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <Button asChild size="lg" className="luxury-btn-primary px-6 sm:px-8 touch-friendly">
                <Link to="/about">
                  Discover Our Story
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Newsletter Section */}
      <motion.section 
        className="py-16 sm:py-20 md:py-24 bg-gradient-sage luxury-section scroll-fade-in"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="serif-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-reforma-brown luxury-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Join the Thought Collective
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-reforma-brown/80 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Be the first to discover new collections, exclusive insights, and the philosophy behind conscious fashion.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <NewsletterForm />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;