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

export const orderService = {
  // Create new order
  async createOrder(orderData, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(orderData)
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
        throw new Error(error.message || 'Failed to create order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get all orders (Admin only)
  async getAllOrders(params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`;
    
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(url, {
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
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order by ID
  async getOrderById(id, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
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
        throw new Error('Failed to fetch order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Get user orders
  async getUserOrders(userId, params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/orders/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(url, {
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
        throw new Error('Failed to fetch user orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Update order status (Admin only)
  async updateOrderStatus(id, statusData, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(statusData)
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
        throw new Error(error.message || 'Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cancel order
  async cancelOrder(id, reason, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({ reason })
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
        throw new Error(error.message || 'Failed to cancel order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // Get order analytics (Admin only)
  async getOrderAnalytics(params = {}, token) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/orders/analytics/summary${queryString ? `?${queryString}` : ''}`;
    
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(url, {
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
        throw new Error('Failed to fetch order analytics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw error;
    }
  },

  // Track order (public method)
  async trackOrder(orderNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/track/${orderNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to track order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error tracking order:', error);
      throw error;
    }
  }
};
