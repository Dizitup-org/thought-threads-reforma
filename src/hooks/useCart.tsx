import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  gsm?: number;
  collection: string;
  image_url?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, size: string, gsm?: number) => void;
  updateQuantity: (id: string, size: string, gsm: number | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existingItem = prev.find(item => 
        item.id === product.id && 
        item.size === product.size && 
        item.gsm === product.gsm
      );
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && item.size === product.size && item.gsm === product.gsm
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string, size: string, gsm?: number) => {
    setItems(prev => prev.filter(item => !(
      item.id === id && 
      item.size === size && 
      item.gsm === gsm
    )));
  };

  const updateQuantity = (id: string, size: string, gsm: number | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size, gsm);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.size === size && item.gsm === gsm
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};