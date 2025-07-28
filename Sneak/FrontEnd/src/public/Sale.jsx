import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Star, ShoppingCart, Plus, Flame } from 'lucide-react';
import { cartService } from '../services/cartService';

const Sale = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchSaleProducts();
  }, [sortBy, priceRange]);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/products?category=sale');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || data.products || []);
      }
    } catch (error) {
      console.error('Error fetching sale products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      await cartService.addToCart(userData.id, {
        productId: product.id,
        quantity: 1,
        size: product.availableSizes?.[0] || '9',
        color: product.availableColors?.[0] || 'Black'
      }, token);
      
      // Show success feedback
      alert('Product added to cart successfully!');
      
      // Dispatch cart update event to update navigation cart count
      window.dispatchEvent(new Event('cartUpdated'));
      console.log('Cart update event dispatched');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
        const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
        return discountB - discountA;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const ProductCard = ({ product }) => {
    const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    
    return (
      <div 
        className="group relative bg-sneakhead-gray rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-sneakhead-light-gray cursor-pointer"
        onClick={() => handleProductClick(product)}
      >
        <div className="aspect-square relative overflow-hidden">
          <img
            src={product.images?.[0] || '/src/images/default-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 bg-gradient-to-r from-sneakhead-red to-orange-500 text-white px-3 py-2 rounded-md text-sm font-bold flex items-center space-x-1 animate-pulse">
            <Flame className="w-4 h-4" />
            <span>{discountPercentage}% OFF</span>
          </div>
          {discountPercentage >= 50 && (
            <div className="absolute top-12 left-3 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold">
              HOT DEAL!
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-sneakhead-red transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-400 text-sm ml-2">({product.reviewCount || 0})</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-xl">${product.price}</span>
                <span className="text-gray-500 line-through text-lg">${product.originalPrice}</span>
              </div>
              <span className="text-green-400 text-sm font-medium">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              disabled={addingToCart[product.id]}
              className="bg-sneakhead-red hover:bg-sneakhead-red-light text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{addingToCart[product.id] ? 'Adding...' : 'Grab Now'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-sneakhead-black text-white">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-900/30 via-orange-900/30 to-yellow-900/30 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sneakhead-red/10 to-orange-500/10 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center mb-4">
            <Flame className="w-8 h-8 text-orange-500 mr-2" />
            <h1 className="text-4xl md:text-6xl font-black font-grotesk">
              MEGA <span className="text-transparent bg-clip-text bg-gradient-to-r from-sneakhead-red to-orange-500">SALE</span>
            </h1>
            <Flame className="w-8 h-8 text-orange-500 ml-2" />
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            Unbeatable discounts on premium sneakers - Limited time offers!
          </p>
          <div className="text-center">
            <span className="bg-gradient-to-r from-sneakhead-red to-orange-500 text-white px-6 py-2 rounded-full text-lg font-bold">
              Up to 70% OFF
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sale products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sneakhead-red"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sneakhead-red [&>option]:bg-sneakhead-gray [&>option]:text-white"
          >
            <option value="discount">Highest Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
          </select>

          {/* Price Filter */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sneakhead-red [&>option]:bg-sneakhead-gray [&>option]:text-white"
          >
            <option value="all">All Prices</option>
            <option value="0-50">Under $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200+">$200+</option>
          </select>
        </div>

        {/* Sale Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-r from-sneakhead-red/20 to-orange-500/20 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold text-white">{sortedProducts.length}</h3>
            <p className="text-gray-400">Items on Sale</p>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold text-white">
              {sortedProducts.length > 0 
                ? Math.max(...sortedProducts.map(p => Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)))
                : 0}%
            </h3>
            <p className="text-gray-400">Max Discount</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 text-center">
            <h3 className="text-2xl font-bold text-white">
              ${sortedProducts.length > 0 
                ? Math.max(...sortedProducts.map(p => p.originalPrice - p.price)).toFixed(0)
                : 0}
            </h3>
            <p className="text-gray-400">Max Savings</p>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <h3 className="text-2xl font-bold text-gray-400 mb-4">No Sale Items Found</h3>
                <p className="text-gray-500">Check back soon for amazing deals!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sale;
