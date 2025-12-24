import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SaleBanner from "@/components/SaleBanner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Shop = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedGsm, setSelectedGsm] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collections, setCollections] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [allGsms, setAllGsms] = useState<number[]>([]);

  const [wishlistProfileId, setWishlistProfileId] = useState<string | null>(null);
  const [wishlistedProductIds, setWishlistedProductIds] = useState<Set<string>>(new Set());

  // Available GSM options as per requirements
  const gsmOptions = [180, 210, 220, 240];

  useEffect(() => {
    fetchProducts();
    fetchCollections();
    fetchWishlist();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('products-shop-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('Shop page: Real-time product change detected:', payload);
        fetchProducts();
      })
      .subscribe((status) => {
        console.log('Shop page: Products channel status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWishlistProfileId(null);
        setWishlistedProductIds(new Set());
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile?.id) {
        setWishlistProfileId(null);
        setWishlistedProductIds(new Set());
        return;
      }

      setWishlistProfileId(profile.id);

      const { data: rows, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', profile.id);

      if (error) throw error;

      const next = new Set((rows || []).map((r: any) => String(r.product_id)));
      setWishlistedProductIds(next);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistProfileId(null);
      setWishlistedProductIds(new Set());
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Login required',
          description: 'Please log in to use your wishlist.',
          variant: 'destructive',
        });
        return;
      }

      let profileId = wishlistProfileId;
      if (!profileId) {
        const { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        profileId = profile?.id ?? null;
        setWishlistProfileId(profileId);
      }

      if (!profileId) {
        toast({
          title: 'Profile not found',
          description: 'Please try again after logging in.',
          variant: 'destructive',
        });
        return;
      }

      const isAlready = wishlistedProductIds.has(productId);

      if (isAlready) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', profileId)
          .eq('product_id', productId);
        if (error) throw error;

        setWishlistedProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });

        toast({ title: 'Removed from wishlist' });
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: profileId, product_id: productId });
        if (error) throw error;

        setWishlistedProductIds((prev) => new Set(prev).add(productId));

        toast({ title: 'Added to wishlist' });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: 'Wishlist error',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCollection, selectedTag, selectedSize, selectedGsm, sortBy]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
      
      // Extract unique tags
      const allTags = data?.flatMap(p => p.tags || []) || [];
      const uniqueTags = [...new Set(allTags)];
      setTags(uniqueTags);
      
      // Extract all GSM values
      const allGsms = data?.flatMap(p => p.gsm || []) || [];
      const uniqueGsms = [...new Set(allGsms)].sort((a, b) => a - b);
      setAllGsms(uniqueGsms);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('name');
      
      if (error) throw error;
      setCollections(data?.map(c => c.name) || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Collection filter
    if (selectedCollection !== "all") {
      filtered = filtered.filter(product => product.collection === selectedCollection);
    }

    // Tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter(product => 
        product.tags?.includes(selectedTag)
      );
    }

    // Size filter
    if (selectedSize !== "all") {
      filtered = filtered.filter(product => 
        product.sizes.includes(selectedSize)
      );
    }

    // GSM filter
    if (selectedGsm !== "all") {
      filtered = filtered.filter(product => 
        product.gsm?.includes(Number(selectedGsm))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          const priceA = a.is_on_sale && a.discounted_price ? a.discounted_price : a.price;
          const priceB = b.is_on_sale && b.discounted_price ? b.discounted_price : b.price;
          return priceA - priceB;
        case "price-high":
          const priceA2 = a.is_on_sale && a.discounted_price ? a.discounted_price : a.price;
          const priceB2 = b.is_on_sale && b.discounted_price ? b.discounted_price : b.price;
          return priceB2 - priceA2;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
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
    <div className="min-h-screen pt-24 pb-12">
      <SaleBanner />
      
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="serif-heading text-4xl md:text-5xl font-bold mb-4 text-reforma-brown">
            Our Collection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover thoughtfully crafted pieces that embody sophistication and conscious design.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-8 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                {/* Search */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-reforma"
                  />
                </div>

                {/* Collection Filter */}
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="input-reforma">
                    <SelectValue placeholder="All Collections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Collections</SelectItem>
                    {collections.map(collection => (
                      <SelectItem key={collection} value={collection}>
                        {collection}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tag Filter */}
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="input-reforma">
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {tags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Size Filter */}
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="input-reforma">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>

                {/* GSM Filter */}
                <Select value={selectedGsm} onValueChange={setSelectedGsm}>
                  <SelectTrigger className="input-reforma">
                    <SelectValue placeholder="All GSM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All GSM</SelectItem>
                    {gsmOptions.map(gsm => (
                      <SelectItem key={gsm} value={gsm.toString()}>
                        {gsm} GSM
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort and View Mode */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 input-reforma">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="btn-reforma"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="btn-reforma"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Badge variant="secondary" className="badge-reforma">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl text-muted-foreground mb-4">No products found</p>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </motion.div>
        ) : (
          <motion.div 
            className={`grid gap-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard
                  product={transformProductForCard(product)}
                  showQuickActions
                  isWishlisted={wishlistedProductIds.has(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Shop;