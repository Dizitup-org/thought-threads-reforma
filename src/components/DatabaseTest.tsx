import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const DatabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [testData, setTestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [storageStatus, setStorageStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const { toast } = useToast();

  useEffect(() => {
    testConnection();
    testStorageConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus("checking");
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .limit(3);
      
      if (error) throw error;
      
      setTestData(data || []);
      setConnectionStatus("connected");
      toast({
        title: "Database Connection Successful",
        description: "Connected to your Supabase database successfully!",
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

  const testStorageConnection = async () => {
    try {
      setStorageStatus("checking");
      // Test storage access by listing files in the product-images bucket
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('', {
          limit: 1
        });
      
      if (error) throw error;
      
      setStorageStatus("connected");
    } catch (error) {
      console.error("Storage connection error:", error);
      setStorageStatus("disconnected");
    }
  };

  const insertTestProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: "Test Product - Real-time Sync",
            price: 99.99,
            collection: "Test Collection",
            stock: 10,
            sizes: ["M", "L"],
            description: "This is a test product to verify real-time synchronization.",
            featured: false,
            image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Test Product Created",
        description: "Successfully created a test product. Check if it appears in the shop!",
      });
      
      // Refresh the test data
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
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
              {connectionStatus === "checking" ? "Checking database connection..." :
               connectionStatus === "connected" ? "Connected to Supabase Database" :
               "Database Disconnected"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              storageStatus === "checking" ? "bg-yellow-500 animate-pulse" :
              storageStatus === "connected" ? "bg-green-500" :
              "bg-red-500"
            }`}></div>
            <span>
              {storageStatus === "checking" ? "Checking storage connection..." :
               storageStatus === "connected" ? "Connected to Supabase Storage" :
               "Storage Disconnected"}
            </span>
          </div>
          
          {connectionStatus === "connected" && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Found {testData.length} sample products in database:
              </p>
              <div className="space-y-1">
                {testData.map((product) => (
                  <div key={product.id} className="text-sm">
                    • {product.name}
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={insertTestProduct} 
                className="mt-4 btn-elegant"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Test Product"}
              </Button>
            </div>
          )}
          
          <Button 
            onClick={testConnection} 
            variant="outline" 
            size="sm"
            disabled={connectionStatus === "checking"}
          >
            Re-test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};