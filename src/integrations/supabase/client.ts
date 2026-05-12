<<<<<<< HEAD
// No more direct database imports - using API endpoints instead

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
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Query builder interface to match Supabase's API
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
      const queryParams = new URLSearchParams({
        ...this.whereConditions
      });

      const response = await fetch(`${API_BASE_URL}/api/${this.tableName}?${queryParams}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete error:', error);
      return { data: null, error, count: 0 };
    }
  }

  // Execute the query and return results
  async execute() {
    try {
      if (this.insertData) {
        // POST request for insert
        const response = await fetch(`${API_BASE_URL}/api/${this.tableName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.insertData[0]) // For now, handle single insert
        });

        const result = await response.json();
        return result;
      } else if (this.updateData) {
        // PUT request for update
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

        const result = await response.json();
        return result;
      } else {
        // GET request for select
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

        const result = await response.json();
        return result;
      }
    } catch (error) {
      console.error('Query execution error:', error);
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

// Mock authentication for now - you'll need to implement proper auth
class Auth {
  async signUp(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      // In a real implementation, call your auth API
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        data: { user: null, session: null },
        error: error as Error
      };
    }
  }

  async signInWithPassword(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      // In a real implementation, call your auth API
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Signin failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        data: { user: null, session: null },
        error: error as Error
      };
    }
  }

  async signOut() {
    // Implement sign out logic if needed
    return { error: null };
  }

  async getSession(): Promise<{ data: { session: Session | null }; error: Error | null }> {
    // For now return a mock session - you'll need to implement proper session management
    return {
      data: { session: null },
      error: null
    };
  }

  async getUser(): Promise<{ data: { user: User | null }; error: Error | null }> {
    // For now return no user - you'll need to implement proper user management
    return {
      data: { user: null },
      error: null
    };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    // Mock auth state change - implement real auth state management
    return {
      data: { subscription: { unsubscribe: () => {} } },
      error: null
    };
  }
}

// Mock realtime for channels - you'll need to implement WebSocket or similar
class RealtimeClient {
  channel(channelName: string) {
    return {
      on: (event: string, config: any, callback: (payload: any) => void) => {
        // Mock implementation - implement real realtime functionality
        return this;
      },
      subscribe: (callback?: (status: string) => void) => {
        if (callback) callback('SUBSCRIBED');
        return 'SUBSCRIBED';
      }
    };
  }

  removeChannel(channel: any) {
    // Mock implementation
  }
}

// Main Supabase client
class SupabaseClient {
  public auth: Auth;
  private realtime: RealtimeClient;

  constructor() {
    this.auth = new Auth();
    this.realtime = new RealtimeClient();
  }

  from(tableName: string) {
    return new QueryBuilder(tableName);
  }

  // Channel method for realtime
  channel(channelName: string) {
    return this.realtime.channel(channelName);
  }

  removeChannel(channel: any) {
    return this.realtime.removeChannel(channel);
  }

  // Raw query method for custom queries
  async query(sql: string, params: any[] = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        data: null,
        error,
        count: 0
      };
    }
  }
}

// Create and export the client instance
export const supabase = new SupabaseClient();

// Admin client - for administrative operations
export const getAdminClient = () => {
  return supabase; // Same instance for now, but you can create specialized admin logic later
};

export default supabase;
=======
// A dummy supabase client to prevent crashes until we fully migrate to fetch API
export const supabase: any = {
  channel: () => ({
    on: () => ({ subscribe: () => {} })
  }),
  removeChannel: () => {},
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    eq: function() { return this; },
    order: function() { return this; },
    single: async () => ({ data: null, error: null }),
  }),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    admin: {
      deleteUser: async () => ({ error: null })
    }
  }
};
export const getAdminClient = () => supabase;
>>>>>>> 4da70c100a89228ca868e4a11a5f9fd8eb1ef97b
