import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Star,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2 as TrashIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { productService } from '../services/productService';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    stock: '',
    featured: false
  });

  // Image handling state
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // Helper function to validate image URL
    const getValidImageUrl = (imageUrl) => {
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
  };

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, currentPage]);

  // Fetch products when component mounts to ensure fresh data
  useEffect(() => {
    fetchProducts();
  }, []);

  // Refresh products when user navigates back to this page
  useEffect(() => {
    const handleFocus = () => {
      fetchProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      // Only add search and category if they have valid values
      if (searchTerm && searchTerm.trim() !== '' && searchTerm.trim() !== 'undefined') {
        params.search = searchTerm.trim();
      }
      if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'undefined') {
        params.category = selectedCategory;
      }
      
      const response = await productService.getAllProducts(params);
      console.log('Products response:', response); // Debug log
      
      // Handle different response structures
      const productsData = response.data || response.rows || response;
      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
      } catch (tokenError) {
        alert('Invalid token. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      // Use existing compressed images from state
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stock), // Backend expects stockQuantity
        images: images.map(img => img.preview), // Use already compressed images
        isActive: true
      };

      await productService.updateProduct(selectedProduct.id, productData, token);
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      setImages([]); // Clear images
      await fetchProducts(); // Ensure this is awaited
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
    } catch (err) {
      console.error('Error updating product:', err);
      
      if (err.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // Check if it's an authentication error
      if (err.message && (err.message.includes('Invalid or expired token') || err.message.includes('403'))) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      setError('Failed to update product: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
      } catch (tokenError) {
        alert('Invalid token. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      // Show loading state
      setLoading(true);
      
      const response = await productService.deleteProduct(productId, token);
      
      if (response.success) {
        // Remove the product from local state immediately for better UX
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
        
        // Show success message
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000); // Clear after 3 seconds
        
        // Refresh the product list to ensure consistency
        await fetchProducts();
      } else {
        setError('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      
      if (err.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // Check if it's an authentication error
      if (err.message && err.message.includes('Invalid or expired token')) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      setError('Failed to delete product: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      brand: product.brand || '',
      category: product.category || '',
      stock: product.stockQuantity || product.stock || '', // Handle both stockQuantity and stock
      featured: product.isFeatured || product.featured || false
    });
    
    // Convert existing images to the new format
    const existingImages = Array.isArray(product.images) ? product.images : [];
    const convertedImages = existingImages.map((imageUrl, index) => ({
      id: `existing-${index}`,
      file: null,
      preview: imageUrl
    }));
    setImages(convertedImages);
    
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      brand: '',
      category: '',
      stock: '',
      featured: false
    });
    setImages([]);
  };

  // Image handling functions
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Compress the image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set maximum dimensions (reduced for smaller file size)
          const maxWidth = 400;
          const maxHeight = 300;
          
          let { width, height } = img;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress with lower quality
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5); // 50% quality for smaller size
          
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file,
            preview: compressedDataUrl
          }]);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const categories = ['all', 'men', 'women', 'kids', 'sale', 'featured'];

  const getStatusBadge = (status, stock) => {
    if (stock === 0) return 'bg-red-500/20 text-red-400';
    if (stock <= 10) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-green-500/20 text-green-400';
  };

  const getStatusText = (status, stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Reset to page 1 if current page is invalid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-grotesk text-white mb-2">Product Management</h1>
        <p className="text-gray-400">Manage your sneaker inventory and product listings</p>
      </div>
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Product Count */}
            <div className="text-gray-400 text-sm">
              Showing {currentProducts.length} of {filteredProducts.length} products
            </div>
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white appearance-none cursor-pointer"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                {categories.map(category => (
                  <option key={category} value={category} style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-3 bg-sneakhead-red hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            title="Refresh product list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <p className="text-green-400 text-center">{successMessage}</p>
          </div>
        )}

        {/* Products Table */}
        <div className="glass-dark rounded-2xl border border-sneakhead-light-gray overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red mx-auto mb-4"></div>
              <p className="text-gray-400">Loading products...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sneakhead-light-gray">
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">#</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Product</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Brand</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Category</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Price</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Stock</th>
                      <th className="text-right p-6 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product, index) => (
                      <tr 
                        key={product.id} 
                        className="border-b border-sneakhead-light-gray hover:bg-sneakhead-gray/30 transition-colors group"
                      >
                        <td className="p-6">
                          <span className="text-gray-400 font-medium">#{startIndex + index + 1}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center space-x-4">
                                            <img
                  src={getValidImageUrl(Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : product.image)}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
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
                            <div>
                              <h3 className="text-white font-medium group-hover:text-sneakhead-red transition-colors">
                                {product.name}
                              </h3>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-gray-300 text-sm font-medium">
                            {product.brand || 'N/A'}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-sneakhead-light-gray rounded-full text-gray-300 text-sm capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className="text-white font-semibold">${Number(product.price).toFixed(2)}</span>
                        </td>
                        <td className="p-6">
                          <span className={`font-medium ${
                            product.stock === 0 ? 'text-red-400' : 
                            product.stock <= 10 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleEdit(product)}
                              className="p-2 hover:bg-sneakhead-light-gray rounded-lg transition-colors group/btn"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-400 transition-colors" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="p-2 hover:bg-sneakhead-light-gray rounded-lg transition-colors group/btn"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-400 transition-colors" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Empty State */}
              {products.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'No products available in the inventory.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
            {/* Pagination Info and Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-gray-400 text-sm">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="text-gray-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            
        


        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-dark rounded-2xl border border-sneakhead-light-gray w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-sneakhead-light-gray">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Edit Product</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProduct(null);
                      resetForm();
                      setImages([]);
                    }}
                    className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl text-white focus:border-sneakhead-red focus:outline-none"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl text-white focus:border-sneakhead-red focus:outline-none"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl text-white focus:border-sneakhead-red focus:outline-none"
                    placeholder="Enter product description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl text-white focus:border-sneakhead-red focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-black border border-sneakhead-light-gray rounded-xl text-white focus:border-sneakhead-red focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.filter(cat => cat !== 'all').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl text-white focus:border-sneakhead-red focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {/* Product Images */}
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Product Images</label>
                  
                  {/* Image Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer mb-4
                      ${dragOver 
                        ? 'border-sneakhead-red bg-sneakhead-red/10' 
                        : 'border-sneakhead-light-gray hover:border-sneakhead-red/50'
                      }
                    `}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload-edit"
                    />
                    <label htmlFor="image-upload-edit" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        Drag and drop images here or <span className="text-sneakhead-red">browse</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">Supports: JPG, PNG, GIF (Max 5MB each)</p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={getValidImageUrl(image.preview)}
                            alt="Product preview"
                            className="w-full h-24 object-cover rounded-lg"
                            onError={(e) => {
                              const fallbackUrl = '/src/images/default-product.jpg';
                              // Prevent infinite loop by checking if we're already using fallback
                              if (e.target.src !== fallbackUrl) {
                                e.target.src = fallbackUrl;
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured-edit"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-3 rounded border-sneakhead-light-gray"
                  />
                  <label htmlFor="featured-edit" className="text-gray-400 text-sm">Featured Product</label>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProduct(null);
                      resetForm();
                      setImages([]);
                    }}
                    className="flex-1 px-6 py-3 border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-glow flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Product</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default ProductManagement;
