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

export const cartService = {
  // Get user's cart
  async getCart(userId, token) {
    try {
      console.log('CartService: Getting cart for user', userId);
      
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${validToken}`
        }
      });
      
      if (response.status === 403) {
        const error = await response.json();
        if (error.error === 'jwt expired') {
          // Clear expired token and throw specific error
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('TOKEN_EXPIRED');
        }
      }
      
      if (!response.ok) {
        const error = await response.json();
        console.error('CartService: Get cart error', error);
        throw new Error('Failed to fetch cart');
      }
      
      const result = await response.json();
      console.log('CartService: Get cart success', result);
      console.log('CartService: Cart data structure', {
        hasData: !!result.data,
        dataType: typeof result.data,
        hasItems: !!result.data?.CartItems,
        itemsLength: result.data?.CartItems?.length,
        items: result.data?.CartItems,
        totalItems: result.data?.totalItems,
        subtotal: result.data?.subtotal
      });
      return result;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(userId, itemData, token) {
    try {
      console.log('CartService: Adding to cart', { userId, itemData });
      
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(itemData)
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
        console.error('CartService: Error response', error);
        throw new Error(error.message || 'Failed to add item to cart');
      }
      
      const result = await response.json();
      console.log('CartService: Add to cart success', result);
      console.log('CartService: Add to cart response structure', {
        hasData: !!result.data,
        dataType: typeof result.data,
        hasItems: !!result.data?.CartItems,
        itemsLength: result.data?.CartItems?.length,
        items: result.data?.CartItems,
        totalItems: result.data?.totalItems,
        subtotal: result.data?.subtotal
      });
      return result;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(userId, itemId, quantity, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({ quantity })
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
        throw new Error(error.message || 'Failed to update cart item');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(userId, itemId, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/items/${itemId}`, {
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
        throw new Error(error.message || 'Failed to remove item from cart');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  async clearCart(userId, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
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
        throw new Error(error.message || 'Failed to clear cart');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Apply promo code
  async applyPromoCode(userId, promoCode, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify({ promoCode })
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
        throw new Error(error.message || 'Failed to apply promo code');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw error;
    }
  },

  // Remove promo code
  async removePromoCode(userId, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/promo`, {
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
        throw new Error(error.message || 'Failed to remove promo code');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing promo code:', error);
      throw error;
    }
  }
};
