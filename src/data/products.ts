import overthinkImage from "@/assets/product-overthink.jpg";
import deepThoughtsImage from "@/assets/product-deep-thoughts.jpg";
import introspectionImage from "@/assets/product-introspection.jpg";

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
    name: "OVERTHINK",
    price: 35,
    image: overthinkImage,
    collection: "Mind Series",
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "For those who turn thoughts into art. Embrace the beautiful chaos of an active mind.",
    featured: true,
  },
  {
    id: "2",
    name: "DEEP THOUGHTS",
    price: 40,
    image: deepThoughtsImage,
    collection: "Mind Series",
    stock: 8,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Dive into the depths of consciousness. Perfect for the contemplative soul.",
    featured: true,
  },
  {
    id: "3",
    name: "INTROSPECTION",
    price: 38,
    image: introspectionImage,
    collection: "Cosmic Collection",
    stock: 15,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Journey inward with cosmic style. Where philosophy meets fashion.",
    featured: true,
  },
];

export const collections = [
  {
    id: "mind-series",
    name: "Mind Series",
    description: "Explore the depths of thought and consciousness",
    products: products.filter(p => p.collection === "Mind Series"),
  },
  {
    id: "cosmic-collection",
    name: "Cosmic Collection",
    description: "Where philosophy meets the cosmos",
    products: products.filter(p => p.collection === "Cosmic Collection"),
  },
];

export const getFeaturedProducts = () => products.filter(p => p.featured);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getProductsByCollection = (collection: string) => 
  products.filter(p => p.collection === collection);