import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminTest = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [testProduct, setTestProduct] = useState({
    name: "Test Product",
    price: 50,
    collection: "Test Collection",
    stock: 10,
    sizes: ["M", "L"],
    description: "Test product for verification"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createTestProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([testProduct])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Product created",
        description: "Test product created successfully",
      });
      
      fetchProducts();
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Error creating product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "Product deleted successfully",
      });
      
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-warm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="serif-heading text-4xl font-bold text-reforma-brown mb-8">Admin Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Create Test Product</h2>
            <button 
              onClick={createTestProduct}
              className="btn-reforma px-4 py-2 rounded"
            >
              Create Test Product
            </button>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-4">Products ({products.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">₹{product.price}</p>
                  </div>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTest;