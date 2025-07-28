import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, ShoppingCart, Plus } from 'lucide-react';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const AllProducts = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts({ limit: 100 });
      setProducts(response.data || response.products || response || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, event) => {
    event.preventDefault();
    event.stopPropagation();
    
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

  // Filter and sort products
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(product => 
    selectedCategory === 'all' || product.category?.toLowerCase() === selectedCategory.toLowerCase()
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name?.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const categories = ['all', 'men', 'women', 'kids', 'sale', 'featured'];

  if (loading) {
    return (
      <div className="min-h-screen bg-sneakhead-black text-white flex items-center justify-center">
        <div className="text-2xl font-bold">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sneakhead-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-sneakhead-red/20 to-sneakhead-red/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-black font-grotesk mb-4">
            ALL PRODUCTS
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Discover our complete collection of premium sneakers for every style and occasion.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-sneakhead-red"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-sneakhead-black border border-gray-700 rounded-xl text-white focus:outline-none focus:border-sneakhead-red"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-sneakhead-black border border-gray-700 rounded-xl text-white focus:outline-none focus:border-sneakhead-red"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-900 border border-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-sneakhead-red text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-sneakhead-red text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className={`group block ${
                  viewMode === 'list' ? 'flex items-center space-x-4 bg-gray-900 p-4 rounded-xl hover:bg-gray-800' : 'bg-gray-900 p-4 rounded-xl hover:bg-gray-800'
                }`}
              >
                {/* Product Image */}
                <div 
                  className={`relative overflow-hidden rounded-xl bg-gray-800 cursor-pointer ${
                    viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'
                  }`}
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={(() => {
                      const imageUrl = product.images?.[0];
                      const fallbackUrl = '/src/images/default-product.jpg';
                      
                      // More comprehensive validation
                      if (!imageUrl || 
                          typeof imageUrl !== 'string' ||
                          imageUrl === 'data:image/jpeg;base64:1' || 
                          imageUrl === 'data:image/jpeg;base64:' ||
                          imageUrl === 'data:image/jpeg;base64' ||
                          imageUrl.length < 100 ||
                          imageUrl.includes('undefined') ||
                          imageUrl.includes('null') ||
                          imageUrl === '' ||
                          imageUrl === 'null' ||
                          imageUrl === 'undefined' ||
                          imageUrl.trim() === '') {
                        return fallbackUrl;
                      }
                      
                      // Check for corrupted or incomplete base64
                      if (imageUrl.startsWith('data:image/')) {
                        if (imageUrl.length < 200 || !imageUrl.includes(',')) {
                          return fallbackUrl;
                        }
                        // Check if base64 part is valid
                        const base64Part = imageUrl.split(',')[1];
                        if (!base64Part || base64Part.length < 50) {
                          return fallbackUrl;
                        }
                      }
                      
                      return imageUrl;
                    })()}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/src/images/default-product.jpg';
                    }}
                    onLoad={(e) => {
                      // If image loads successfully but is very small, use fallback
                      if (e.target.naturalWidth < 10 || e.target.naturalHeight < 10) {
                        e.target.src = '/src/images/default-product.jpg';
                      }
                    }}
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-sneakhead-red text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className={viewMode === 'list' ? 'flex-1' : 'mt-4'}>
                  <h3 
                    className={`font-bold text-white group-hover:text-sneakhead-red transition-colors cursor-pointer ${
                      viewMode === 'list' ? 'text-lg' : 'text-xl'
                    }`}
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{product.brand}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sneakhead-red font-bold text-lg">
                        ${product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-gray-500 line-through text-sm">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    {viewMode === 'list' && (
                      <span className="text-gray-400 text-sm capitalize">
                        {product.category}
                      </span>
                    )}
                  </div>

                  {viewMode === 'grid' && (
                    <p className="text-gray-400 text-sm mt-2 capitalize">
                      {product.category}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={addingToCart[product.id]}
                      className="w-full bg-sneakhead-red hover:bg-sneakhead-red-light text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">{addingToCart[product.id] ? 'Adding...' : 'Grab Now'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-400 mb-4">No Products Found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts; 