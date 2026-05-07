// 🔧 PURE MOCK IMPLEMENTATION - NO API CALLS
// Development-only client that uses local mock data

console.log('🔧 Supabase Client: Running with MOCK DATA for development');

export interface User {
  id: string;
  email?: string;
  auth_user_id?: string;
  [key: string]: any;
}

export interface Session {
  user: User;
  access_token?: string;
  [key: string]: any;
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
}

// Mock Products Data
const MOCK_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Premium Wireless Headphones',
    type: 'Electronics',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    featured: true,
    description: 'High-quality wireless headphones with noise cancellation',
    stock: 50,
    rating: 4.5,
    reviews_count: 324,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: 'Smart Fitness Tracker',
    type: 'Wearables', 
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400',
    category: 'Wearables',
    featured: true,
    description: 'Advanced fitness tracker with heart rate monitoring',
    stock: 30,
    rating: 4.3,
    reviews_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: 'Eco-Friendly Backpack',
    type: 'Accessories',
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    category: 'Accessories',
    featured: false,
    description: 'Sustainable backpack made from recycled materials',
    stock: 25,
    rating: 4.7,
    reviews_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_4', 
    name: 'Wireless Charging Pad',
    type: 'Electronics',
    price: 49.99,
    originalPrice: 69.99,
    discount: 29,
    image: 'https://images.unsplash.com/photo-1586953209892-e324ef96d05a?w=400',
    category: 'Electronics',
    featured: false,
    description: 'Fast wireless charging for all devices',
    stock: 75,
    rating: 4.2,
    reviews_count: 203,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_5',
    name: 'Organic Cotton T-Shirt',
    type: 'Clothing',
    price: 29.99,
    originalPrice: 39.99,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Clothing',
    featured: false,
    description: 'Comfortable organic cotton t-shirt in various colors',
    stock: 100,
    rating: 4.4,
    reviews_count: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod_6',
    name: 'Smart Home Hub',
    type: 'Electronics',
    price: 129.99,
    originalPrice: 179.99,
    discount: 28,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'Electronics',
    featured: true,
    description: 'Control all your smart devices from one hub',
    stock: 40,
    rating: 4.6,
    reviews_count: 145,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Mock Banners Data 
const MOCK_BANNERS = [
  {
    id: 'banner_1',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off selected items',
    buttonText: 'Shop Now',
    link: '/shop',
    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    active: true
  }
];

// Query builder that returns mock data
class QueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private whereConditions: { [key: string]: any } = {};
  private orderByField: string = '';
  private limitValue: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions[column] = value;
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions[`${column}_neq`] = value;
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions[`${column}_gt`] = value;
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions[`${column}_gte`] = value;
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions[`${column}_lt`] = value;
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions[`${column}_lte`] = value;
    return this;
  }

  like(column: string, pattern: string) {
    this.whereConditions[`${column}_like`] = pattern;
    return this;
  }

  ilike(column: string, pattern: string) {
    this.whereConditions[`${column}_ilike`] = pattern;
    return this;
  }

  in(column: string, values: any[]) {
    this.whereConditions[`${column}_in`] = values;
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    const direction = options.ascending !== false ? 'asc' : 'desc';
    this.orderByField = `${column}:${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  // Execute the query and return mock data
  async execute() {
    console.log(`🔧 Mock Query: ${this.tableName}`, {
      select: this.selectFields,
      where: this.whereConditions,
      order: this.orderByField,
      limit: this.limitValue
    });

    try {
      let data: any[] = [];

      // Return appropriate mock data based on table name
      if (this.tableName === 'products') {
        data = [...MOCK_PRODUCTS];

        // Apply filters
        Object.entries(this.whereConditions).forEach(([key, value]) => {
          if (key === 'featured') {
            data = data.filter(item => item.featured === value);
          } else if (key === 'category') {
            data = data.filter(item => item.category === value);
          } else if (key === 'type') {
            data = data.filter(item => item.type === value);
          }
        });

        // Apply ordering
        if (this.orderByField.includes('created_at:desc')) {
          data = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (this.orderByField.includes('price:asc')) {
          data = data.sort((a, b) => a.price - b.price);
        } else if (this.orderByField.includes('price:desc')) {
          data = data.sort((a, b) => b.price - a.price);
        }

        // Apply limit
        if (this.limitValue) {
          data = data.slice(0, this.limitValue);
        }

      } else if (this.tableName === 'banners') {
        data = [...MOCK_BANNERS];
      }

      console.log(`✅ Mock Query Result: Found ${data.length} records`);

      return {
        data: data,
        error: null,
        count: data.length,
        status: 200,
        statusText: 'OK'
      };

    } catch (error) {
      console.error('Mock query error:', error);
      return {
        data: null,
        error,
        count: 0,
        status: 500,
        statusText: 'Internal Server Error'
      };
    }
  }

  // Alias for execute to match Supabase API
  async then(resolve: any, reject?: any) {
    const result = await this.execute();
    if (result.error) {
      return reject ? reject(result.error) : resolve(result);
    }
    return resolve(result);
  }
}

// Mock authentication
class Auth {
  async signUp(credentials: { email: string; password: string }): Promise<AuthResponse> {
    console.log('🔧 Mock Auth: Sign Up', credentials.email);
    return {
      data: { 
        user: { id: 'mock_user_1', email: credentials.email },
        session: { user: { id: 'mock_user_1', email: credentials.email }, access_token: 'mock_token' }
      },
      error: null
    };
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    console.log('🔧 Mock Auth: Sign In', credentials.email);
    return {
      data: { 
        user: { id: 'mock_user_1', email: credentials.email },
        session: { user: { id: 'mock_user_1', email: credentials.email }, access_token: 'mock_token' }
      },
      error: null
    };
  }

  async signOut() {
    console.log('🔧 Mock Auth: Sign Out');
    return { error: null };
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: Error | null }> {
    return {
      data: { session: null },
      error: null
    };
  }

  async getUser(): Promise<{ data: { user: User | null }; error: Error | null }> {
    return {
      data: { user: null },
      error: null
    };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    console.log('🔧 Mock Auth: Auth State Change Listener Added');
    // Mock auth state - call callback after 100ms with no session
    setTimeout(() => {
      callback('INITIAL_SESSION', null);
    }, 100);
    
    return {
      data: { subscription: { unsubscribe: () => console.log('🔧 Mock Auth: Unsubscribed') } },
      error: null
    };
  }
}

// RealtimeClient for handling channel subscriptions
class RealtimeClient {
  private channels: { [key: string]: RealtimeChannel } = {};

  channel(name: string, opts?: any) {
    if (!this.channels[name]) {
      this.channels[name] = new RealtimeChannel(name);
    }
    return this.channels[name];
  }

  removeChannel(channel: RealtimeChannel) {
    console.log('🔧 Mock Realtime: Channel removed', channel.topic);
    delete this.channels[channel.topic];
    return Promise.resolve('ok');
  }

  disconnect() {
    console.log('🔧 Mock Realtime: Disconnected');
    this.channels = {};
  }
}

// RealtimeChannel for handling real-time subscriptions  
class RealtimeChannel {
  topic: string;
  private listeners: { [key: string]: Function[] } = {};

  constructor(topic: string) {
    this.topic = topic;
    console.log('🔧 Mock Realtime: Channel created:', topic);
  }

  on(type: string, filter: any, callback: Function) {
    console.log('🔧 Mock Realtime: Listener added:', type, filter);
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
    return this;
  }

  subscribe(callback?: Function) {
    console.log('🔧 Mock Realtime: Channel subscribed:', this.topic);
    if (callback) {
      setTimeout(() => callback('SUBSCRIBED'), 100);
    }
    
    return {
      unsubscribe: () => {
        console.log('🔧 Mock Realtime: Channel unsubscribed:', this.topic);
        this.listeners = {};
      }
    };
  }

  unsubscribe() {
    console.log('🔧 Mock Realtime: Channel unsubscribed:', this.topic);
    this.listeners = {};
    return Promise.resolve('ok');
  }
}

// Main Supabase client class
class SupabaseClient {
  auth: Auth;
  private realtimeClient: RealtimeClient;

  constructor() {
    this.auth = new Auth();
    this.realtimeClient = new RealtimeClient();
    console.log('🔧 Supabase Mock Client initialized');
  }

  from(tableName: string) {
    return new QueryBuilder(tableName);
  }

  channel(name: string, opts?: any) {
    return this.realtimeClient.channel(name, opts);
  }

  removeChannel(channel: RealtimeChannel) {
    return this.realtimeClient.removeChannel(channel);
  }

  getChannels() {
    return [];
  }

  // Storage mock
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        console.log('🔧 Mock Storage: Upload', bucket, path);
        return { data: null, error: null };
      },
      
      getPublicUrl: (path: string) => {
        console.log('🔧 Mock Storage: Get public URL', path);
        return { 
          data: { publicUrl: `https://mock-storage.example.com/${path}` }
        };
      },

      download: async (path: string) => {
        console.log('🔧 Mock Storage: Download', path);
        return { data: null, error: null };
      },

      remove: async (paths: string[]) => {
        console.log('🔧 Mock Storage: Remove', paths);
        return { data: null, error: null };
      }
    })
  };
}

// Create and export the client instance
const supabase = new SupabaseClient();

export { supabase };
export default supabase;