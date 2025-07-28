import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  Save, 
  ArrowLeft, 
  Image as ImageIcon,
  Plus,
  Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { productService } from '../services/productService';

const AddEditProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    isActive: true,
    brand: '',
    availableSizes: [],
    availableColors: [],
    features: [],
    specifications: {},
    discountPercentage: 0
  });

  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const categories = [
    'men',
    'women', 
    'kids',
    'sale',
    'featured'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          
          // Set maximum dimensions
          const maxWidth = 800;
          const maxHeight = 600;
          
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
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          
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



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stock), // Backend expects stockQuantity
        isActive: true, // Ensure product is active by default
        isFeatured: formData.category === 'featured', // Set featured flag based on category
        images: images.map(img => img.preview), // For now, using preview URLs
        availableSizes: formData.availableSizes.length > 0 ? formData.availableSizes : ['7', '8', '9', '10', '11', '12'],
        availableColors: formData.availableColors.length > 0 ? formData.availableColors : ['Black', 'White'],
        features: formData.features.length > 0 ? formData.features : ['Premium quality', 'Comfortable fit'],
        specifications: formData.specifications || {
          material: 'Premium materials',
          sole: 'Rubber',
          closure: 'Lace-up'
        }
      };
      
      // Create product
      const response = await productService.createProduct(productData, token);
      console.log('Product creation response:', response); // Debug log
      
      if (response.success) {
        alert('Product created successfully!');
        navigate('/admin/products');
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      if (error.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-grotesk text-white mb-2">Add Product</h1>
        <p className="text-gray-400">Create a new sneaker listing for your store</p>
      </div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/admin/products"
            className="flex items-center text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </Link>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              form="product-form"
              disabled={loading}
              className="btn-glow flex items-center space-x-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Creating...' : 'Add Product'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="glass-dark p-8 rounded-2xl border border-sneakhead-light-gray">
            <h3 className="text-xl font-bold text-white mb-6 font-grotesk">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-300 font-medium mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Air Jordan 1 Retro High OG"
                  className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Nike, Adidas, Jordan"
                  className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400"
                  required
                />
              </div>
              

              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white appearance-none cursor-pointer"
                  style={{ backgroundColor: '#1a1a1a' }}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category} style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.category === 'sale' && (
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Original Price ($)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  {formData.category === 'sale' ? 'Sale Price ($)' : 'Price ($)'}
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400"
                  required
                />
                {formData.category === 'sale' && formData.originalPrice && formData.price && (
                  <div className="mt-2 p-3 bg-sneakhead-red/10 border border-sneakhead-red/20 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Discount:</span>
                      <span className="text-sneakhead-red font-bold">
                        {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-300">Amount Saved:</span>
                      <span className="text-green-400 font-bold">
                        ${(formData.originalPrice - formData.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400"
                  required
                />
              </div>
              

            </div>
          </div>

          {/* Description */}
          <div className="glass-dark p-8 rounded-2xl border border-sneakhead-light-gray">
            <h3 className="text-xl font-bold text-white mb-6 font-grotesk">Description</h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Write a detailed description of the product, including features, materials, and styling details..."
              rows={6}
              className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400 resize-vertical"
              required
            />
          </div>

          {/* Product Images */}
          <div className="glass-dark p-8 rounded-2xl border border-sneakhead-light-gray">
            <h3 className="text-xl font-bold text-white mb-6 font-grotesk">Product Images</h3>
            
            {/* Image Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
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
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">Drop images here or click to upload</p>
                <p className="text-gray-400 text-sm">Support: JPG, PNG, WebP (Max 5MB each)</p>
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-sneakhead-red text-white px-2 py-1 rounded text-xs font-medium">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>


        </form>
      </div>
    );
  };

export default AddEditProduct;
