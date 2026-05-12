// Frontend API utilities - these make HTTP calls to your API endpoints
// No direct database connections in the frontend

// Generic API response interface
export interface ApiResponse<T = any> {
  data: T | null;
  error: Error | null;
  count?: number;
  status?: number;
  statusText?: string;
}

// Determine the API base URL
// VITE_API_URL must be set in Netlify env vars to your Render backend, e.g. https://reforma-backend.onrender.com
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Safe fetch wrapper - handles non-OK responses and non-JSON bodies without crashing
async function safeFetch(url: string, options?: RequestInit): Promise<ApiResponse> {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`, url);
      return { data: [], error: `API error: ${res.status} ${res.statusText}` };
    }

    const text = await res.text();

    try {
      const json = JSON.parse(text);
      return json;
    } catch {
      console.error('Invalid JSON response from', url, ':', text.slice(0, 200));
      return { data: [], error: 'Invalid JSON response' };
    }
  } catch (err) {
    console.error('Network error:', err);
    return { data: [], error: (err as Error).message };
  }
}

// Products API
export const productsApi = {
  // Get all products with optional filters
  async getAll(filters: {
    featured?: boolean;
    collection?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (filters.featured !== undefined) queryParams.append('featured', String(filters.featured));
    if (filters.collection) queryParams.append('collection', filters.collection);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', String(filters.limit));
    if (filters.offset) queryParams.append('offset', String(filters.offset));
    return safeFetch(`${API_BASE_URL}/api/products?${queryParams}`);
  },

  // Get product by ID
  async getById(id: string): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/products?id=${id}`);
  },

  // Create a new product
  async create(productData: any): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
  },

  // Update a product
  async update(id: string, productData: any): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/products?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
  },

  // Delete a product
  async delete(id: string): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/products?id=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Users API
export const usersApi = {
  // Get user by ID
  async getById(id: string): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/users?id=${id}`);
  },

  // Get user by email
  async getByEmail(email: string): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/users?email=${encodeURIComponent(email)}`);
  },

  // Create a new user
  async create(userData: any): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  },

  // Update a user
  async update(id: string, userData: any): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/users?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  }
};

// Newsletter API
export const newsletterApi = {
  // Subscribe to newsletter
  async subscribe(email: string): Promise<ApiResponse> {
    return safeFetch(`${API_BASE_URL}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  }
};