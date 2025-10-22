import { useState, useEffect, useMemo } from "react";
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
import { Search, Filter, Grid, List, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import SaleBanner from "@/components/SaleBanner";
import { supabase } from "@/integrations/supabase/client";

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
  created_at?: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collections, setCollections] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCollections();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('products-shop-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filterAndSortProducts = useMemo(() => {
    let filtered = [...products];

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

    return filtered;
  }, [products, searchTerm, selectedCollection, selectedTag, sortBy]);

  useEffect(() => {
    setFilteredProducts(filterAndSortProducts);
  }, [filterAndSortProducts]);

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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCollection("all");
    setSelectedTag("all");
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

  const activeFilters = [
    selectedCollection !== "all" && `Collection: ${selectedCollection}`,
    selectedTag !== "all" && `Tag: ${selectedTag}`,
    searchTerm && `Search: "${searchTerm}"`
  ].filter(Boolean);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <SaleBanner />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 md:mb-12 text-center">
          <h1 className="serif-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-elegant">
            Our Collection
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover thoughtfully crafted pieces that embody sophistication and conscious design.
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 shadow-elegant transition-all duration-300 hover:shadow-deep">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-elegant transition-all duration-300 focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Collection Filter */}
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="transition-all duration-300 hover:border-accent">
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
                <SelectTrigger className="transition-all duration-300 hover:border-accent">
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

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="transition-all duration-300 hover:border-accent">
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

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/30 rounded-md">
                <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="transition-all duration-300 hover:scale-105">
                    {filter}
                  </Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Badge variant="secondary" className="transition-all duration-300">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-elegant mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
            <Button 
              onClick={clearFilters}
              className="btn-elegant transition-all duration-300 hover:scale-105"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 transition-all duration-500 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <ProductCard
                  product={transformProductForCard(product)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;