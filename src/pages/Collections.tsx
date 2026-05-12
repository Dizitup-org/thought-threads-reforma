import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, FolderOpen, Package } from "lucide-react";

interface Product {
  id: string;
  product_name: string;
  price: number;
  images?: string[];
  collection: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  products: Product[];
}

// ── Skeleton card for loading state ─────────────────────────────────────────
const CollectionSkeleton = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.12 }}
    className="rounded-2xl border border-border/60 overflow-hidden bg-card shadow-md"
  >
    {/* shimmer header */}
    <div className="p-6 border-b border-border/40 flex items-center justify-between">
      <div className="h-7 w-40 rounded-lg bg-muted overflow-hidden relative">
        <div className="shimmer-wave absolute inset-0" />
      </div>
      <div className="h-6 w-16 rounded-full bg-muted overflow-hidden relative">
        <div className="shimmer-wave absolute inset-0" />
      </div>
    </div>

    {/* shimmer description */}
    <div className="px-6 pt-4 pb-2 space-y-2">
      <div className="h-4 w-full rounded bg-muted overflow-hidden relative">
        <div className="shimmer-wave absolute inset-0" />
      </div>
      <div className="h-4 w-3/4 rounded bg-muted overflow-hidden relative">
        <div className="shimmer-wave absolute inset-0" />
      </div>
    </div>

    {/* shimmer image grid */}
    <div className="px-6 py-4 grid grid-cols-3 gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="aspect-square rounded-lg bg-muted overflow-hidden relative">
          <div className="shimmer-wave absolute inset-0" style={{ animationDelay: `${i * 0.15}s` }} />
        </div>
      ))}
    </div>

    {/* shimmer button */}
    <div className="px-6 pb-6">
      <div className="h-11 w-full rounded-lg bg-muted overflow-hidden relative">
        <div className="shimmer-wave absolute inset-0" />
      </div>
    </div>
  </motion.div>
);

// ── Main loading view ────────────────────────────────────────────────────────
const LoadingView = () => (
  <div className="min-h-screen pt-24 pb-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Animated header placeholder */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <FolderOpen className="h-8 w-8 text-reforma-brown/50" />
          </motion.div>
          <span className="text-lg text-muted-foreground font-medium tracking-widest uppercase">
            Loading Collections
          </span>
        </motion.div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-reforma-brown/30"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>

      {/* Skeleton grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <CollectionSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [orphanedProducts, setOrphanedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);

      // Fetch both in parallel for speed
      const [collectionsRes, productsRes] = await Promise.all([
        fetch("/api/collections"),
        fetch("/api/products"),
      ]);

      if (!collectionsRes.ok) throw new Error("Failed to fetch collections");
      if (!productsRes.ok) throw new Error("Failed to fetch products");

      const [collectionsData, productsData] = await Promise.all([
        collectionsRes.json(),
        productsRes.json(),
      ]);

      // Group products by collection name — use correct DB field names
      const knownNames = new Set((collectionsData || []).map((c: any) => c.name));

      const collectionsWithProducts: Collection[] = (collectionsData || []).map(
        (col: any) => ({
          id: col.id,
          name: col.name,
          description: col.description || "",
          products: (productsData || [])
            .filter((p: any) => p.collection === col.name)
            .map((p: any) => ({
              id: p.id,
              product_name: p.product_name,
              price: p.price,
              images: p.images,
              collection: p.collection,
            })),
        })
      );

      // Find orphaned products — those whose collection string doesn't match any collection record
      // (stale data from before cascade fix, or manually entered strings)
      const orphans: Product[] = (productsData || [])
        .filter((p: any) => p.collection && p.collection.trim() !== '' && !knownNames.has(p.collection))
        .map((p: any) => ({
          id: p.id,
          product_name: p.product_name,
          price: p.price,
          images: p.images,
          collection: p.collection,
        }));

      setCollections(collectionsWithProducts);
      setOrphanedProducts(orphans);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingView />;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="serif-heading text-4xl md:text-5xl font-bold mb-4 text-reforma-brown luxury-heading">
            COLLECTIONS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-6">
            Curated drops inspired by cinema, philosophy, and the depths of
            human consciousness. Each collection tells a unique story for the
            thinking mind.
          </p>
        </motion.div>

        {/* Collections Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-border/60 bg-card shadow-md overflow-hidden flex flex-col hover:shadow-xl hover:border-reforma-brown/30 transition-all duration-300"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <h2 className="serif-heading text-2xl text-reforma-brown font-semibold">
                      {collection.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className="border-reforma-brown/30 text-reforma-brown px-3 py-1"
                    >
                      {collection.products.length}{" "}
                      {collection.products.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  {collection.description && (
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {collection.description}
                    </p>
                  )}
                </div>

                {/* Product preview images */}
                {collection.products.length > 0 ? (
                  <div className="p-4 flex-1">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {collection.products.slice(0, 3).map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="block"
                        >
                          <motion.div
                            className="aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.25 }}
                          >
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground/40" />
                              </div>
                            )}
                          </motion.div>
                        </Link>
                      ))}
                    </div>

                    {/* Product list */}
                    <div className="space-y-2">
                      {collection.products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="flex justify-between items-center text-sm py-1.5 px-2 rounded-lg hover:bg-muted/60 transition-colors group"
                        >
                          <span className="font-medium text-reforma-brown group-hover:underline underline-offset-2">
                            {product.product_name}
                          </span>
                          <span className="text-reforma-brown font-bold">
                            ₹{Number(product.price).toFixed(0)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground/60">
                    <Package className="h-10 w-10 mb-2" />
                    <p className="text-sm">No products yet</p>
                  </div>
                )}

                {/* Explore button — properly linked to filtered shop */}
                <div className="p-5 pt-0">
                  <Link
                    to={`/shop?collection=${encodeURIComponent(collection.name)}`}
                    className="block"
                  >
                    <Button className="w-full luxury-btn-primary py-3 font-semibold tracking-wide group">
                      Explore {collection.name}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}

            {collections.length === 0 && (
              <motion.div
                className="col-span-2 text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FolderOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">
                  No collections found. Ask admin to create some!
                </p>
              </motion.div>
            )}
          </div>
        </AnimatePresence>

        {/* ── Orphaned / Uncategorized Products ──────────────────────────── */}
        {orphanedProducts.length > 0 && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
                <Package className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">
                  Uncategorized ({orphanedProducts.length})
                </span>
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-6">
              These products have a collection name that no longer matches any collection record.
              Re-assign them in the Admin panel or re-create the matching collection.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {orphanedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-amber-200/60 bg-amber-50/40 hover:bg-amber-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.id}`} className="hover:underline underline-offset-2">
                      <p className="font-semibold text-reforma-brown truncate">{product.product_name}</p>
                    </Link>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Was in: &quot;{product.collection}&quot;
                    </p>
                  </div>
                  <span className="text-reforma-brown font-bold shrink-0">
                    ₹{Number(product.price).toFixed(0)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Coming Soon Section */}
        <motion.div
          className="text-center bg-gradient-to-br from-reforma-brown/5 to-reforma-sage/10 p-12 rounded-2xl border border-border/60"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Sparkles className="mx-auto h-12 w-12 text-reforma-brown/50 mb-4" />
          <h2 className="serif-heading text-3xl font-bold mb-4 text-reforma-brown">
            More Collections{" "}
            <span className="text-reforma-sage">Coming Soon</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're working on new themed drops inspired by iconic films,
            philosophical movements, and the endless depths of human thought.
            Stay tuned for updates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button
                variant="outline"
                className="border-reforma-brown text-reforma-brown hover:bg-reforma-brown hover:text-white transition-colors px-8"
              >
                Join Our Newsletter
              </Button>
            </Link>
            <Link to="/shop">
              <Button className="luxury-btn-primary px-8">
                Shop Current Drops
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Collections;