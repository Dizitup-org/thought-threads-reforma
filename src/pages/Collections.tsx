import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  collection: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  products: Product[];
}

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      
      // Fetch all collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (collectionsError) throw collectionsError;

      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      // Group products by collection
      const collectionsWithProducts = (collectionsData || []).map(collection => ({
        id: collection.id,
        name: collection.name,
        description: collection.description || '',
        products: (productsData || [])
          .filter(p => p.collection === collection.name)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
            collection: p.collection
          }))
      }));

      setCollections(collectionsWithProducts);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            <span className="glitch" data-text="COLLECTIONS">COLLECTIONS</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Curated drops inspired by cinema, philosophy, and the depths of human consciousness. 
            Each collection tells a unique story for the thinking mind.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {collections.map((collection, index) => (
            <Card 
              key={collection.id} 
              className="product-card group overflow-hidden h-full animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-2xl text-primary">
                    {collection.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-accent text-accent">
                    {collection.products.length} items
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-muted-foreground mb-6">
                  {collection.description}
                </p>

                {/* Preview Products */}
                {collection.products.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {collection.products.slice(0, 3).map((product) => (
                      <div key={product.id} className="aspect-square overflow-hidden rounded-md">
                        <img
                          src={product.image_url || ''}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {collection.products.map((product) => (
                    <div key={product.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-primary font-bold">₹{product.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full btn-hero text-accent-foreground font-semibold">
                  <Link to="/shop">
                    Explore Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="text-center bg-gradient-cosmic p-12 rounded-lg border border-border">
          <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="font-heading text-3xl font-bold mb-4">
            More Collections <span className="text-primary">Coming Soon</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're working on new themed drops inspired by iconic films, philosophical movements, 
            and the endless depths of human thought. Stay tuned for updates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/contact">
                Join Our Newsletter
              </Link>
            </Button>
            <Button asChild className="btn-hero text-accent-foreground font-semibold">
              <Link to="/shop">
                Shop Current Drops
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;