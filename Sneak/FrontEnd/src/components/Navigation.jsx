import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cartService } from '../services/cartService';

// Navigation component with responsive design and cart management

/**
 * Navigation Component
 * Main navigation bar with search functionality, cart management, and user authentication
 * Responsive design with mobile menu support
 */
const Navigation = () => {
  // State management for navigation features
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Navigation and authentication hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();

  /**
   * Fetch cart count when component mounts or user logs in
   * Updates cart count in real-time for better UX
   */
  useEffect(() => {
    const fetchCartCount = async () => {
      if (isLoggedIn && user?.id) {
        try {
          const token = localStorage.getItem('token');
          console.log('Fetching cart count for user:', user.id);
          
          // Get cart data from API
          const response = await cartService.getCart(user.id, token);
          const items = response.data?.CartItems || response.data?.items || response.items || [];
          
          // Calculate total quantity of items in cart
          const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
          console.log('Cart items:', items, 'Total count:', totalCount);
          setCartCount(totalCount);
        } catch (error) {
          console.error('Error fetching cart count:', error);
          
          // Handle token expiration
          if (error.message === 'TOKEN_EXPIRED') {
            // Token expired, logout user
            logout();
            navigate('/login');
            return;
          }
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();
  }, [isLoggedIn, user?.id]);

  // Listen for cart updates (you can implement a custom event or use a global state)
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isLoggedIn && user?.id) {
        const fetchCartCount = async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await cartService.getCart(user.id, token);
            const items = response.data?.CartItems || response.data?.items || response.items || [];
            const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(totalCount);
          } catch (error) {
            console.error('Error fetching cart count:', error);
            if (error.message === 'TOKEN_EXPIRED') {
              // Token expired, logout user
              logout();
              navigate('/login');
              return;
            }
          }
        };
        fetchCartCount();
      }
    };

    // Listen for custom cart update event
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isLoggedIn, user?.id]);

  const navigationItems = [
    { name: 'HOME', path: '/', active: location.pathname === '/' },
    { name: 'MEN', path: '/men', active: location.pathname === '/men' },
    { name: 'WOMEN', path: '/women', active: location.pathname === '/women' },
    { name: 'KIDS', path: '/kids', active: location.pathname === '/kids' },
    { name: 'SALE', path: '/sale', active: location.pathname === '/sale', highlight: true },
  ];

  const handleLogout = () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to logout?');
    
    if (isConfirmed) {
      logout();
      navigate('/');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.products || data || []);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <>
      <nav className="bg-sneakhead-black border-b border-sneakhead-light-gray sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src="/src/images/Logo.png" 
                alt="SNEAKHEAD Logo" 
                className="w-12 h-12 rounded-full transform group-hover:scale-105 transition-transform duration-300"
              />
              <span className="ml-3 text-2xl font-black font-grotesk text-white tracking-tight">
                SNEAK<span className="text-sneakhead-red">HEAD</span>
              </span>
            </Link>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`font-medium font-grotesk tracking-wide transition-all duration-300 hover:scale-105 ${
                    item.active
                      ? 'text-white border-b-2 border-sneakhead-red'
                      : item.highlight
                      ? 'text-sneakhead-red hover:text-sneakhead-red-light'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-64 px-4 py-2 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sneakhead-red"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="ml-2 p-2 text-white hover:text-sneakhead-red transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                      className="ml-2 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* User-specific actions */}
              {isLoggedIn ? (
                <>
                  {/* Cart */}
                  <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-sneakhead-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* User Profile */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden sm:block">{user?.name || 'User'}</span>
                    </button>
                    
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg shadow-xl overflow-hidden z-50">
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-sneakhead-black transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Profile
                          </Link>
                          <Link
                            to="/my-orders"
                            className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-sneakhead-black transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            My Orders
                          </Link>
                          <div className="border-t border-sneakhead-light-gray my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sneakhead-red hover:bg-sneakhead-black transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Login Button for guests */
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-sneakhead-red hover:bg-sneakhead-red-light text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-sneakhead-light-gray">
            <div className="py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sneakhead-red"
                  />
                </div>
              </form>
              
              <hr className="border-sneakhead-light-gray" />
              
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-2 font-medium font-grotesk tracking-wide transition-colors ${
                    item.active
                      ? 'text-white bg-sneakhead-red/10'
                      : item.highlight
                      ? 'text-sneakhead-red'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <hr className="border-sneakhead-light-gray" />
              
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/cart"
                    className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sneakhead-red hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-4 py-2 text-sneakhead-red hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Search Results Popup */}
      {showSearchResults && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
          <div className="bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sneakhead-light-gray">
              <h2 className="text-2xl font-bold text-white">
                Search Results for "{searchQuery}"
              </h2>
              <button
                onClick={closeSearchResults}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Results */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {searchLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((product) => (
                    <div key={product.id} className="group relative bg-sneakhead-black rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-sneakhead-light-gray">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={product.images?.[0] || '/src/images/default-product.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="absolute top-3 left-3 bg-sneakhead-red text-white px-2 py-1 rounded-md text-sm font-bold">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-sneakhead-red transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-bold text-lg">${product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
                            )}
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-sneakhead-red hover:bg-sneakhead-red-light text-white px-4 py-2 rounded-lg transition-colors"
                            onClick={closeSearchResults}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-2xl font-bold text-gray-400 mb-4">No Results Found</h3>
                  <p className="text-gray-500 mb-6">
                    Try searching with different keywords
                  </p>
                  <button
                    onClick={closeSearchResults}
                    className="bg-sneakhead-red hover:bg-sneakhead-red-light text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;