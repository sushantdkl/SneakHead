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

export const userService = {
  // Get all users (Admin only)
  async getUsers(token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/users`, {
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
        throw new Error('Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
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
        throw new Error('Failed to fetch user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id, userData, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(userData)
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
        throw new Error(error.message || 'Failed to update user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
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
        throw new Error(error.message || 'Failed to delete user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get user profile
  async getProfile(token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
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
        throw new Error('Failed to fetch profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData, token) {
    try {
      // Validate token before making request
      const validToken = token || getValidToken();
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validToken}`
        },
        body: JSON.stringify(userData)
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
        throw new Error(error.message || 'Failed to update profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

// Auth service
export const authService = {
  // Login
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      if (data.data?.access_token) {
        localStorage.setItem('token', data.data.access_token);
        // Transform user data to include isAdmin property for consistency
        const userData = {
          ...data.data.user,
          isAdmin: data.data.user.role === 'admin'
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      if (data.data?.access_token) {
        localStorage.setItem('token', data.data.access_token);
        // Transform user data to include isAdmin property for consistency
        const userData = {
          ...data.data.user,
          isAdmin: data.data.user.role === 'admin'
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get stored token
  getToken() {
    try {
      return getValidToken();
    } catch (error) {
      // Token is expired, clear it and return null
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Get stored user
  getUser() {
    try {
      // Check if token is valid before returning user
      getValidToken();
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      // Token is expired, clear user data and return null
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    try {
      return !!getValidToken();
    } catch (error) {
      return false;
    }
  }
};