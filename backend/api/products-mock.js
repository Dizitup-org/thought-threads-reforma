// Development mock data - replace with real database calls
const mockProducts = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    price: 89.99,
    image_url: '/images/tshirt-1.jpg',
    collection: 'Essentials',
    stock: 50,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    gsm: [180, 200],
    description: 'Luxury cotton t-shirt with perfect fit and premium quality fabric.',
    featured: true,
    tags: ['cotton', 'premium', 'comfortable'],
    discount_percentage: null,
    discounted_price: null,
    is_on_sale: false,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2', 
    name: 'Minimalist Hoodie',
    price: 129.99,
    image_url: '/images/hoodie-1.jpg',
    collection: 'Comfort',
    stock: 30,
    sizes: ['S', 'M', 'L', 'XL'],
    gsm: [320],
    description: 'Clean, minimalist design with superior comfort and warmth.',
    featured: true,
    tags: ['hoodie', 'warm', 'minimalist'],
    discount_percentage: 15,
    discounted_price: 110.49,
    is_on_sale: true,
    created_at: '2024-02-01T14:20:00Z'
  },
  {
    id: '3',
    name: 'Elegant Button-Down',
    price: 159.99,
    image_url: '/images/shirt-1.jpg',
    collection: 'Formal',
    stock: 25,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    gsm: [140],
    description: 'Sophisticated button-down shirt perfect for any occasion.',
    featured: false,
    tags: ['formal', 'elegant', 'versatile'],
    discount_percentage: null,
    discounted_price: null,
    is_on_sale: false,
    created_at: '2024-02-10T09:15:00Z'
  },
  {
    id: '4',
    name: 'Casual Polo',
    price: 99.99,
    image_url: '/images/polo-1.jpg',
    collection: 'Casual',
    stock: 40,
    sizes: ['S', 'M', 'L', 'XL'],
    gsm: [200],
    description: 'Classic polo shirt with modern fit and premium materials.',
    featured: false,
    tags: ['polo', 'casual', 'classic'],
    discount_percentage: null,
    discounted_price: null,
    is_on_sale: false,
    created_at: '2024-02-15T16:45:00Z'
  },
  {
    id: '5',
    name: 'Luxury Sweater',
    price: 199.99,
    image_url: '/images/sweater-1.jpg',
    collection: 'Premium',
    stock: 15,
    sizes: ['S', 'M', 'L'],
    gsm: [280],
    description: 'Ultra-soft luxury sweater crafted from the finest materials.',
    featured: true,
    tags: ['sweater', 'luxury', 'soft'],
    discount_percentage: null,
    discounted_price: null,
    is_on_sale: false,
    created_at: '2024-02-20T11:30:00Z'
  },
  {
    id: '6',
    name: 'Relaxed Joggers',
    price: 79.99,
    image_url: '/images/joggers-1.jpg',
    collection: 'Comfort',
    stock: 60,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    gsm: [250],
    description: 'Comfortable joggers perfect for relaxation and light activities.',
    featured: false,
    tags: ['joggers', 'comfort', 'relaxed'],
    discount_percentage: 20,
    discounted_price: 63.99,
    is_on_sale: true,
    created_at: '2024-02-25T13:20:00Z'
  }
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;

    switch (method) {
      case 'GET':
        if (query.id) {
          // Get single product by ID
          const product = mockProducts.find(p => p.id === query.id);
          res.status(200).json({
            data: product || null,
            error: null,
            count: product ? 1 : 0
          });
        } else {
          // Get all products with filters
          let filteredProducts = [...mockProducts];

          if (query.featured === 'true') {
            filteredProducts = filteredProducts.filter(p => p.featured);
          }

          if (query.collection) {
            filteredProducts = filteredProducts.filter(p => 
              p.collection.toLowerCase() === query.collection.toLowerCase()
            );
          }

          if (query.search) {
            const searchTerm = query.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
              p.name.toLowerCase().includes(searchTerm) ||
              p.description.toLowerCase().includes(searchTerm) ||
              p.collection.toLowerCase().includes(searchTerm)
            );
          }

          // Sort by created_at descending
          filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          if (query.limit) {
            const limit = parseInt(query.limit);
            filteredProducts = filteredProducts.slice(0, limit);
          }

          res.status(200).json({
            data: filteredProducts,
            error: null,
            count: filteredProducts.length
          });
        }
        break;

      case 'POST':
        // Create new product (mock)
        const newProduct = {
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          ...req.body
        };
        mockProducts.push(newProduct);

        res.status(201).json({
          data: newProduct,
          error: null,
          count: 1
        });
        break;

      case 'PUT':
        // Update product (mock)
        if (!query.id) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const productIndex = mockProducts.findIndex(p => p.id === query.id);
        if (productIndex === -1) {
          return res.status(404).json({ error: 'Product not found' });
        }

        mockProducts[productIndex] = { ...mockProducts[productIndex], ...req.body };
        
        res.status(200).json({
          data: mockProducts[productIndex],
          error: null,
          count: 1
        });
        break;

      case 'DELETE':
        // Delete product (mock)
        if (!query.id) {
          return res.status(400).json({ error: 'Product ID required' });
        }

        const deleteIndex = mockProducts.findIndex(p => p.id === query.id);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Product not found' });
        }

        const deletedProduct = mockProducts.splice(deleteIndex, 1)[0];
        
        res.status(200).json({
          data: deletedProduct,
          error: null,
          count: 1
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      data: null,
      error: error.message,
      count: 0
    });
  }
}