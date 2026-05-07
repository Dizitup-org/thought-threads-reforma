export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email?: string;
          auth_user_id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          email?: string;
          auth_user_id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          auth_user_id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          image_url?: string;
          collection: string;
          stock: number;
          sizes: string[];
          gsm?: number[];
          description?: string;
          featured: boolean;
          tags?: string[];
          discount_percentage?: number;
          discounted_price?: number;
          is_on_sale?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          image_url?: string;
          collection: string;
          stock: number;
          sizes: string[];
          gsm?: number[];
          description?: string;
          featured?: boolean;
          tags?: string[];
          discount_percentage?: number;
          discounted_price?: number;
          is_on_sale?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          image_url?: string;
          collection?: string;
          stock?: number;
          sizes?: string[];
          gsm?: number[];
          description?: string;
          featured?: boolean;
          tags?: string[];
          discount_percentage?: number;
          discounted_price?: number;
          is_on_sale?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart: {
        Row: {
          id: string;
          user_id?: string;
          product_id?: string;
          quantity: number;
          size: string;
          gsm?: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          size: string;
          gsm?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          size?: string;
          gsm?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id?: string;
          status?: string;
          total_amount?: number;
          customer_name?: string;
          gsm?: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          status?: string;
          total_amount?: number;
          customer_name?: string;
          gsm?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          total_amount?: number;
          customer_name?: string;
          gsm?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id?: string;
          address_line_1?: string;
          address_line_2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          address_line_1?: string;
          address_line_2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          address_line_1?: string;
          address_line_2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Export common type aliases
export type User = Tables<'users'>;
export type Product = Tables<'products'>;
export type CartItem = Tables<'cart'>;
export type Order = Tables<'orders'>;
export type Address = Tables<'addresses'>;
export type WishlistItem = Tables<'wishlist'>;