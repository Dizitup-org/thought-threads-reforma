import elegantSageImage from "@/assets/product-elegant-sage.jpg";
import elegantBrownImage from "@/assets/product-elegant-brown.jpg";
import elegantCreamImage from "@/assets/product-elegant-cream.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  collection: string;
  stock: number;
  sizes: string[];
  description: string;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "SAGE REFLECTION",
    price: 85,
    image: elegantSageImage,
    collection: "Core Essentials",
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Sophisticated simplicity in muted sage. For minds that seek clarity in complexity.",
    featured: true,
  },
  {
    id: "2",
    name: "EARTH WISDOM",
    price: 90,
    image: elegantBrownImage,
    collection: "Core Essentials",
    stock: 8,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Rich brown elegance meets conscious design. Grounded luxury for thoughtful souls.",
    featured: true,
  },
  {
    id: "3",
    name: "PURE THOUGHT",
    price: 80,
    image: elegantCreamImage,
    collection: "Minimalist Series",
    stock: 15,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Clean cream canvas for profound expression. Where less becomes infinitely more.",
    featured: true,
  },
];

export const collections = [
  {
    id: "core-essentials",
    name: "Core Essentials",
    description: "Timeless pieces that form the foundation of thoughtful wardrobes",
    products: products.filter(p => p.collection === "Core Essentials"),
  },
  {
    id: "minimalist-series",
    name: "Minimalist Series",
    description: "Pure forms and clean lines for minds that appreciate subtle sophistication",
    products: products.filter(p => p.collection === "Minimalist Series"),
  },
];

export const getFeaturedProducts = () => products.filter(p => p.featured);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductsByCollection = (collection: string) => 
  products.filter(p => p.collection === collection);