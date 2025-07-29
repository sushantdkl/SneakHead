import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Star, ShoppingCart, Plus } from 'lucide-react';
import { cartService } from '../services/cartService';

// Women's category page with search and filter functionality
const Women = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchWomenProducts();
  }, [sortBy, priceRange]);

  const fetchWomenProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/products?category=women');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || data.products || []);
      }
    } catch (error) {
      console.error('Error fetching women products:', error);
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

  const ProductCard = ({ product }) => (
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
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-xl">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-500 line-through text-sm">${product.originalPrice}</span>
            )}
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

  return (
    <div className="min-h-screen bg-sneakhead-black text-white">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-900/20 via-sneakhead-gray to-purple-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black font-grotesk mb-4">
            WOMEN'S <span className="text-sneakhead-red">COLLECTION</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Elevate your style with our exclusive women's sneaker collection
          </p>
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
              placeholder="Search women's products..."
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
            <option value="newest">Newest First</option>
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
                <h3 className="text-2xl font-bold text-gray-400 mb-4">No Products Found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Women;
