import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Star,
  Share2,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../components/UserLayout';

const Wishlist = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        // Uncomment and use when wishlistService is available
        // const response = await wishlistService.getWishlist(token);
        // setWishlistItems(response.data || response);
        setWishlistItems([]); // Placeholder for now
      } catch (err) {
        setError('Failed to fetch wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'skateboarding', label: 'Skateboarding' },
    { value: 'collaboration', label: 'Collaborations' }
  ];

  // Filter wishlist items
  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const removeFromWishlist = (itemId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addToCart = (item) => {
    console.log('Adding to cart:', item);
    // Handle add to cart logic
  };

  const shareItem = (item) => {
    // Handle share functionality
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out these ${item.name} on SNEAKHEAD!`,
        url: window.location.href
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const WishlistItemCard = ({ item }) => (
    <div 
      className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 hover:border-sneakhead-red/30 transition-all duration-300 group cursor-pointer"
      onClick={() => handleProductClick(item)}
    >
      {/* Image */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              shareItem(item);
            }}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-sneakhead-red/80 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeFromWishlist(item.id);
            }}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-red-500/80 transition-colors"
            title="Remove from Wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <p className="text-gray-400 text-sm">{item.brand}</p>
          <h3 className="text-white font-bold font-grotesk group-hover:text-sneakhead-red transition-colors">{item.name}</h3>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(item.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-white text-sm">{item.rating}</span>
          <span className="text-gray-400 text-sm">({item.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-sneakhead-red font-bold text-lg">${item.price.toFixed(2)}</span>
          {item.originalPrice > item.price && (
            <span className="text-gray-500 line-through text-sm">${item.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Sizes */}
        <div>
          <p className="text-gray-400 text-sm mb-2">Available Sizes:</p>
          <div className="flex flex-wrap gap-1">
            {item.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="px-2 py-1 bg-sneakhead-gray text-gray-300 text-xs rounded border border-sneakhead-light-gray"
              >
                {size}
              </span>
            ))}
            {item.sizes.length > 4 && (
              <span className="px-2 py-1 text-gray-400 text-xs">
                +{item.sizes.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(item);
            }}
            disabled={!item.inStock}
            className="flex-1 bg-sneakhead-red hover:bg-sneakhead-red-light text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProductClick(item);
            }}
            className="bg-sneakhead-gray hover:bg-sneakhead-light-gray text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const WishlistItemRow = ({ item }) => (
    <div 
      className="glass-dark border border-sneakhead-light-gray rounded-xl p-4 hover:border-sneakhead-red/30 transition-all duration-300 cursor-pointer"
      onClick={() => handleProductClick(item)}
    >
      <div className="flex items-center space-x-4">
        {/* Image */}
        <div className="relative flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          {!item.inStock && (
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <p className="text-gray-400 text-sm">{item.brand}</p>
            <h3 className="text-white font-medium hover:text-sneakhead-red transition-colors">{item.name}</h3>
            <div className="flex items-center space-x-1 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(item.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-xs">({item.reviews})</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sneakhead-red font-bold">${item.price.toFixed(2)}</span>
              {item.originalPrice > item.price && (
                <span className="text-gray-500 line-through text-sm">${item.originalPrice.toFixed(2)}</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-xs">Available Sizes</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.sizes.slice(0, 3).map((size) => (
                <span
                  key={size}
                  className="px-1 py-0.5 bg-sneakhead-gray text-gray-300 text-xs rounded"
                >
                  {size}
                </span>
              ))}
              {item.sizes.length > 3 && (
                <span className="text-gray-400 text-xs">+{item.sizes.length - 3}</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
              disabled={!item.inStock}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.inStock
                  ? 'bg-sneakhead-red hover:bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {item.inStock ? 'Add' : 'N/A'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                shareItem(item);
              }}
              className="p-2 bg-sneakhead-gray hover:bg-sneakhead-light-gray text-white rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromWishlist(item.id);
              }}
              className="p-2 bg-sneakhead-gray hover:bg-red-500 text-white rounded-lg transition-colors"
              title="Remove from Wishlist"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(item);
              }}
              className="p-2 bg-sneakhead-gray hover:bg-sneakhead-light-gray text-white rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <UserLayout title="My Wishlist" subtitle="Your saved sneakers and favorite finds">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white appearance-none cursor-pointer transition-colors"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value} className="bg-sneakhead-gray">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-sneakhead-red text-white'
                  : 'bg-sneakhead-gray text-gray-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-sneakhead-red text-white'
                  : 'bg-sneakhead-gray text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Wishlist Count */}
        {filteredItems.length > 0 && (
          <div className="glass-dark border border-sneakhead-light-gray rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-sneakhead-red" />
                <span className="text-white font-medium">
                  {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in your wishlist
                </span>
              </div>
              <button
                onClick={() => {
                  const inStockItems = filteredItems.filter(item => item.inStock);
                  if (inStockItems.length > 0) {
                    console.log('Adding all in-stock items to cart:', inStockItems);
                  }
                }}
                className="flex items-center px-4 py-2 bg-sneakhead-red hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add All to Cart
              </button>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {loading ? (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <p className="text-gray-400 mb-4">Loading your wishlist...</p>
            <div className="animate-spin text-sneakhead-red w-8 h-8"></div>
          </div>
        ) : error ? (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-gray-400">Please ensure you are logged in or try again later.</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredItems.map((item) => (
              viewMode === 'grid' ? (
                <WishlistItemCard key={item.id} item={item} />
              ) : (
                <WishlistItemRow key={item.id} item={item} />
              )
            ))}
          </div>
        ) : (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm || categoryFilter !== 'all' ? 'No items found' : 'Your wishlist is empty'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : "Save your favorite sneakers here for easy access later."
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <button className="btn-glow px-8 py-3">
                Explore Sneakers
              </button>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Wishlist;
