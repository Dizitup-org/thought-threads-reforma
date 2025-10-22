import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const DatabaseTestPage = () => {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus("checking");
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(5);
      
      if (error) throw error;
      
      setProducts(data || []);
      setConnectionStatus("connected");
      toast({
        title: "Database Connection Successful",
        description: `Found ${data?.length || 0} products in the database.`,
      });
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus("disconnected");
      toast({
        title: "Database Connection Failed",
        description: "Could not connect to Supabase database.",
        variant: "destructive",
      });
    }
  };

  const insertTestProduct = async () => {
    setLoading(true);
    try {
      const testProduct = {
        name: `Test Product ${Date.now()}`,
        price: Math.floor(Math.random() * 100) + 50,
        collection: "Test Collection",
        stock: Math.floor(Math.random() * 20) + 1,
        sizes: ["M", "L"],
        description: "This is a test product to verify real-time synchronization.",
        featured: false,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
      };

      const { data, error } = await supabase
        .from('products')
        .insert([testProduct])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Test Product Created",
        description: "Successfully created a test product. Check if it appears in the shop!",
      });
      
      // Refresh the product list
      setTimeout(() => {
        testConnection();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAllTestProducts = async () => {
    setLoading(true);
    try {
      // Delete all products with names starting with "Test Product"
      const { error } = await supabase
        .from('products')
        .delete()
        .ilike('name', 'Test Product%');
      
      if (error) throw error;
      
      toast({
        title: "Test Products Deleted",
        description: "Successfully removed all test products.",
      });
      
      // Refresh the product list
      setTimeout(() => {
        testConnection();
      }, 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="serif-heading text-4xl font-bold text-elegant mb-2">Database Test</h1>
          <p className="text-muted-foreground">Verify database connection and real-time functionality</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === "checking" ? "bg-yellow-500 animate-pulse" :
                  connectionStatus === "connected" ? "bg-green-500" :
                  "bg-red-500"
                }`}></div>
                <span>
                  {connectionStatus === "checking" ? "Checking connection..." :
                   connectionStatus === "connected" ? "Connected to Supabase" :
                   "Disconnected"}
                </span>
              </div>
              
              {connectionStatus === "connected" && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Found {products.length} products in database:
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="text-sm p-2 bg-muted rounded">
                        <span className="font-medium">{product.name}</span> - ₹{product.price}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={testConnection} 
                  variant="outline" 
                  size="sm"
                  disabled={connectionStatus === "checking" || loading}
                >
                  Re-test Connection
                </Button>
                
                <Button 
                  onClick={insertTestProduct} 
                  className="btn-elegant"
                  disabled={connectionStatus !== "connected" || loading}
                >
                  {loading ? "Creating..." : "Create Test Product"}
                </Button>
                
                <Button 
                  onClick={deleteAllTestProducts} 
                  variant="destructive"
                  disabled={connectionStatus !== "connected" || loading}
                >
                  Delete Test Products
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-time Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                To test real-time functionality:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Click "Create Test Product" to add a new product to the database</li>
                <li>Open the Shop page in another tab</li>
                <li>The new product should appear in the Shop page automatically within seconds</li>
                <li>Try editing or deleting products from the Admin panel</li>
                <li>Changes should be reflected immediately in the Shop page</li>
              </ol>
              <p className="text-sm text-muted-foreground mt-4">
                If products don't appear in real-time, check the browser console for errors and ensure 
                your Supabase project has real-time enabled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTestPage;