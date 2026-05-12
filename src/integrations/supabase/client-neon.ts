// Frontend client that connects to Neon database via API endpoints
console.log('🗄️ Supabase Client: Connecting to Neon Database via API');

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

// Determine the API base URL
// VITE_API_URL must be set in Netlify env vars to your Render backend, e.g. https://reforma-backend.onrender.com
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

console.log('🌍 API Base URL:', API_BASE_URL);

// Query builder that performs real API calls to Neon database
class QueryBuilder {
  private tableName: string;
  private selectFields: string = '*';
  private whereConditions: { [key: string]: any } = {};
  private orderByField: string = '';
  private limitValue: number | null = null;
  private insertData: any = null;
  private updateData: any = null;

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
    this.orderByField = `${column}_${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  insert(data: any | any[]) {
    this.insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  async delete() {
    try {
      console.log(`🗑️ DELETE Request: ${this.tableName}`, this.whereConditions);

      const queryParams = new URLSearchParams(this.whereConditions);
      const response = await fetch(`${API_BASE_URL}/api/${this.tableName}?${queryParams}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ DELETE Success: ${this.tableName}`, result);
      return result;
    } catch (error) {
      console.error(`❌ DELETE Error: ${this.tableName}`, error);
      return { data: null, error, count: 0 };
    }
  }

  // Execute the query and return results from Neon database
  async execute() {
    try {
      if (this.insertData) {
        // POST request for insert
        console.log(`📝 POST Request: ${this.tableName}`, this.insertData[0]);

        const response = await fetch(`${API_BASE_URL}/api/${this.tableName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.insertData[0])
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ POST Success: ${this.tableName}`, result);
        return result;

      } else if (this.updateData) {
        // PUT request for update
        console.log(`📝 PUT Request: ${this.tableName}`, this.updateData);

        const id = this.whereConditions.id;
        if (!id) {
          throw new Error('Update requires an ID');
        }

        const response = await fetch(`${API_BASE_URL}/api/${this.tableName}?id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.updateData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ PUT Success: ${this.tableName}`, result);
        return result;

      } else {
        // GET request for select
        console.log(`🔍 GET Request: ${this.tableName}`, {
          where: this.whereConditions,
          order: this.orderByField,
          limit: this.limitValue
        });

        const queryParams = new URLSearchParams();

        // Add filters
        Object.entries(this.whereConditions).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });

        // Add limit
        if (this.limitValue) {
          queryParams.append('limit', String(this.limitValue));
        }

        // Add order
        if (this.orderByField) {
          queryParams.append('order', this.orderByField);
        }

        const response = await fetch(`${API_BASE_URL}/api/${this.tableName}?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ GET Success: ${this.tableName} - Found ${result.count} records`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Query Error: ${this.tableName}`, error);
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

// Mock authentication for now - implement real auth later
class Auth {
  async signUp(credentials: { email: string; password: string }): Promise<AuthResponse> {
    console.log('🔐 Mock Auth: Sign Up', credentials.email);
    // TODO: Implement real authentication with your auth provider
    return {
      data: { 
        user: { id: 'mock_user_1', email: credentials.email },
        session: { user: { id: 'mock_user_1', email: credentials.email }, access_token: 'mock_token' }
      },
      error: null
    };
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    console.log('🔐 Mock Auth: Sign In', credentials.email);
    // TODO: Implement real authentication with your auth provider
    return {
      data: { 
        user: { id: 'mock_user_1', email: credentials.email },
        session: { user: { id: 'mock_user_1', email: credentials.email }, access_token: 'mock_token' }
      },
      error: null
    };
  }

  async signOut() {
    console.log('🔐 Mock Auth: Sign Out');
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
    console.log('🔐 Mock Auth: Auth State Change Listener Added');
    // Mock auth state - call callback after 100ms with no session
    setTimeout(() => {
      callback('INITIAL_SESSION', null);
    }, 100);
    
    return {
      data: { subscription: { unsubscribe: () => console.log('🔐 Mock Auth: Unsubscribed') } },
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
    console.log('📡 Mock Realtime: Channel removed', channel.topic);
    delete this.channels[channel.topic];
    return Promise.resolve('ok');
  }

  disconnect() {
    console.log('📡 Mock Realtime: Disconnected');
    this.channels = {};
  }
}

// RealtimeChannel for handling real-time subscriptions  
class RealtimeChannel {
  topic: string;
  private listeners: { [key: string]: Function[] } = {};

  constructor(topic: string) {
    this.topic = topic;
    console.log('📡 Mock Realtime: Channel created:', topic);
  }

  on(type: string, filter: any, callback: Function) {
    console.log('📡 Mock Realtime: Listener added:', type, filter);
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
    return this;
  }

  subscribe(callback?: Function) {
    console.log('📡 Mock Realtime: Channel subscribed:', this.topic);
    if (callback) {
      setTimeout(() => callback('SUBSCRIBED'), 100);
    }
    
    return {
      unsubscribe: () => {
        console.log('📡 Mock Realtime: Channel unsubscribed:', this.topic);
        this.listeners = {};
      }
    };
  }

  unsubscribe() {
    console.log('📡 Mock Realtime: Channel unsubscribed:', this.topic);
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
    console.log('🗄️ Supabase client initialized - Connected to Neon Database');
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

  // Storage mock - TODO: implement real storage if needed
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        console.log('💾 Mock Storage: Upload', bucket, path);
        return { data: null, error: null };
      },
      
      getPublicUrl: (path: string) => {
        console.log('💾 Mock Storage: Get public URL', path);
        return { 
          data: { publicUrl: `https://mock-storage.example.com/${path}` }
        };
      },

      download: async (path: string) => {
        console.log('💾 Mock Storage: Download', path);
        return { data: null, error: null };
      },

      remove: async (paths: string[]) => {
        console.log('💾 Mock Storage: Remove', paths);
        return { data: null, error: null };
      }
    })
  };
}

// Create and export the client instance
const supabase = new SupabaseClient();

export { supabase };
export default supabase;