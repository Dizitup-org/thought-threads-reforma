import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { collections } from "@/data/products";
import { ArrowRight, Sparkles } from "lucide-react";

const Collections = () => {
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
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {collection.products.slice(0, 3).map((product) => (
                    <div key={product.id} className="aspect-square overflow-hidden rounded-md">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {collection.products.map((product) => (
                    <div key={product.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-primary font-bold">${product.price}</span>
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