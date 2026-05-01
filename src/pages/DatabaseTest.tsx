import { useState, useEffect } from "react";

export default function DatabaseTest() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/database-test/products');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Products data:', data);
        setProducts(data || []);
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