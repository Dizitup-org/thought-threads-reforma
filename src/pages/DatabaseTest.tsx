import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function DatabaseTest() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('Error:', error);
        } else {
          console.log('Products data:', data);
          setProducts(data || []);
        }
      } catch (error) {
        console.error('Exception:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  );
}