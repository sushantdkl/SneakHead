const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to check if JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Helper function to get valid token or throw error if expired
const getValidToken = () => {
  const token = localStorage.getItem('token');
  if (isTokenExpired(token)) {
    // Clear expired token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw new Error('TOKEN_EXPIRED');
  }
  return token;
};

export const productService = {
  // Get all products with filters
  async getAllProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  async getProductById(id) {
    try {
      console.log('ProductService: Fetching product with ID:', id);
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      console.log('ProductService: Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ProductService: Error response:', errorText);
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      console.log('ProductService: Success response:', data);
      return data;
    } catch (error) {
      console.error('ProductService: Error fetching product:', error);
      throw error;
    }
  },

  // Get featured products
  async getFeaturedProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Create new product (Admin only)
  async createProduct(productData, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(productData)
      });
      
      if (response.status === 403) {
        const error = await response.json();
        if (error.error === 'jwt expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('TOKEN_EXPIRED');
        }
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product (Admin only)
  async updateProduct(id, productData, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(productData)
      });
      
      if (response.status === 403) {
        const error = await response.json();
        if (error.error === 'jwt expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('TOKEN_EXPIRED');
        }
      }
      
      if (!response.ok) {
        let errorMessage = 'Failed to update product';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, try to get text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (Admin only)
  async deleteProduct(id, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${validToken}`
        }
      });
      
      if (response.status === 403) {
        const error = await response.json();
        if (error.error === 'jwt expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('TOKEN_EXPIRED');
        }
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Update product stock (Admin only)
  async updateStock(id, stockQuantity, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({ stockQuantity })
      });
      
      if (response.status === 403) {
        const error = await response.json();
        if (error.error === 'jwt expired') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('TOKEN_EXPIRED');
        }
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update stock');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(searchTerm, filters = {}) {
    const params = {
      search: searchTerm,
      ...filters
    };
    return this.getAllProducts(params);
  },

  // Get products by category
  async getProductsByCategory(category, params = {}) {
    return this.getAllProducts({ category, ...params });
  },

  // Get products by brand
  async getProductsByBrand(brand, params = {}) {
    return this.getAllProducts({ brand, ...params });
  }
};
