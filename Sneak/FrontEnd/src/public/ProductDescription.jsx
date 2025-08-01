import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Truck, 
  RotateCcw, 
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import LoginPopup from '../components/LoginPopup';
import { getSafeImageUrl, handleImageError } from '../utils/imageUtils';

const ProductDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product data
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with ID:', id);
      const response = await productService.getProductById(id);
      console.log('Product response:', response);
      // Handle the response structure from backend
      const productData = response.data || response;
      console.log('Product data:', productData);
      setProduct(productData);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleProceedToCheckout = async () => {
    console.log('Button clicked!');
    console.log('Selected size:', selectedSize);
    
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('User exists:', !!user);
    
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    try {
      setAddingToCart(true);
      console.log('Adding product to cart...');
      console.log('Product ID:', product.id);
      console.log('Quantity:', quantity);
      console.log('Size:', selectedSize);
      console.log('Color:', selectedColor);
      
      // Add product to cart first
      await cartService.addToCart(user.id, {
        productId: product.id,
        quantity: quantity,
        size: selectedSize || 'Default',
        color: selectedColor || 'Default'
      }, token);

      console.log('Product added to cart successfully!');
      console.log('Navigating to checkout...');
      
      // Navigate to checkout page after adding to cart
      navigate('/checkout');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      if (error.message === 'TOKEN_EXPIRED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleFeature = (index) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'delivery', label: 'Delivery & Returns' }
  ];

  // Mock suggested products for now
  const suggestedProducts = [
    {
      id: 2,
      name: 'Air Jordan 1 Low',
      price: 90.00,
      image: 'https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      name: 'Air Jordan 4 Retro',
      price: 200.00,
      image: 'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      name: 'Air Jordan 11 Retro',
      price: 220.00,
      image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 5,
      name: 'Air Jordan 3 Retro',
      price: 190.00,
      image: 'https://images.pexels.com/photos/1407354/pexels-photo-1407354.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];



  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-black">
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Product Not Found</h2>
              <p className="text-gray-400 mb-6">{error || 'The product you are looking for does not exist.'}</p>
              <button 
                onClick={() => window.history.back()} 
                className="btn-glow"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative glass-dark rounded-2xl overflow-hidden group">
                <img
                  src={(() => {
                    const imageUrl = product.images && product.images.length > 0 
                      ? product.images[selectedImage] 
                      : null;
                    
                    const fallbackUrl = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800';
                    
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
                  className="w-full h-96 lg:h-[500px] object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    const fallbackUrl = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800';
                    e.target.src = fallbackUrl;
                  }}
                  onLoad={(e) => {
                    // If image loads successfully but is very small, use fallback
                    if (e.target.naturalWidth < 10 || e.target.naturalHeight < 10) {
                      e.target.src = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800';
                    }
                  }}
                />
                
                {/* Image Navigation */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : product.images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-sneakhead-red/80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage < product.images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-sneakhead-red/80 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}


              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                        selectedImage === index 
                          ? 'ring-2 ring-sneakhead-red scale-105' 
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={(() => {
                          const fallbackUrl = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800';
                          
                          // More comprehensive validation
                          if (!image || 
                              typeof image !== 'string' ||
                              image === 'data:image/jpeg;base64:1' || 
                              image === 'data:image/jpeg;base64:' ||
                              image === 'data:image/jpeg;base64' ||
                              image.length < 100 ||
                              image.includes('undefined') ||
                              image.includes('null') ||
                              image === '' ||
                              image === 'null' ||
                              image === 'undefined' ||
                              image.trim() === '') {
                            return fallbackUrl;
                          }
                          
                          // Check for corrupted or incomplete base64
                          if (image.startsWith('data:image/')) {
                            if (image.length < 200 || !image.includes(',')) {
                              return fallbackUrl;
                            }
                            // Check if base64 part is valid
                            const base64Part = image.split(',')[1];
                            if (!base64Part || base64Part.length < 50) {
                              return fallbackUrl;
                            }
                          }
                          
                          return image;
                        })()}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          const fallbackUrl = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800';
                          e.target.src = fallbackUrl;
                        }}
                        onLoad={(e) => {
                          // If image loads successfully but is very small, use fallback
                          if (e.target.naturalWidth < 10 || e.target.naturalHeight < 10) {
                            e.target.src = 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800';
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              {/* Product Header */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">{product.brand || 'Brand'}</p>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white font-grotesk mb-3">{product.name}</h1>
                  <p className="text-gray-300 text-lg">{product.subtitle || product.category}</p>
                </div>
                

              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-sneakhead-red">${Number(product.price || 0).toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">${Number(product.originalPrice).toFixed(2)}</span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
                    Save ${(Number(product.originalPrice) - Number(product.price)).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Color: {selectedColor || 'Select a color'}</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((colorOption, index) => (
                      <button
                        key={index}
                        onClick={() => colorOption.available !== false && setSelectedColor(colorOption.name || colorOption)}
                        disabled={colorOption.available === false}
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                          selectedColor === (colorOption.name || colorOption)
                            ? 'border-sneakhead-red scale-110'
                            : colorOption.available !== false
                            ? 'border-gray-600 hover:border-gray-400 hover:scale-105'
                            : 'border-gray-800 opacity-50 cursor-not-allowed'
                        }`}
                        style={{ backgroundColor: colorOption.color || '#000000' }}
                        title={colorOption.name || colorOption}
                      >
                        {colorOption.available === false && (
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">×</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Size: {selectedSize || 'Select a size'}</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((sizeOption, index) => (
                      <button
                        key={index}
                        onClick={() => sizeOption.available !== false && setSelectedSize(sizeOption.size || sizeOption)}
                        disabled={sizeOption.available === false}
                        className={`py-3 px-4 rounded-xl border transition-all duration-300 ${
                          selectedSize === (sizeOption.size || sizeOption)
                            ? 'border-sneakhead-red bg-sneakhead-red/10 text-sneakhead-red'
                            : sizeOption.available !== false
                            ? 'border-sneakhead-light-gray text-white hover:border-gray-400 hover:scale-105'
                            : 'border-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        {sizeOption.size || sizeOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Quantity</h3>
                <div className="flex items-center">
                  <div className="flex items-center border border-sneakhead-light-gray rounded-xl">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 hover:bg-sneakhead-gray transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="px-6 py-3 text-white font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 hover:bg-sneakhead-gray transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Proceed to Checkout */}
              <div className="space-y-6">
                <button
                  onClick={() => {
                    console.log('=== BUTTON CLICKED ===');
                    console.log('Button element clicked!');
                    console.log('Selected size:', selectedSize);
                    handleProceedToCheckout();
                  }}
                  disabled={addingToCart}
                  className="w-full py-4 px-6 rounded-xl text-lg font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#ff0000', 
                    color: '#ffffff', 
                    textShadow: '0 0 10px rgba(255,255,255,0.8)',
                    zIndex: 9999, 
                    position: 'relative' 
                  }}
                >
                  {addingToCart ? 'Adding to Cart...' : 'Proceed to Checkout'}
                </button>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="flex flex-col items-center p-3 glass-dark rounded-xl">
                    <Truck className="w-5 h-5 text-sneakhead-red mb-2" />
                    <span className="text-white text-sm font-medium">Free Shipping</span>
                    <span className="text-gray-400 text-xs">Orders over $100</span>
                  </div>
                  <div className="flex flex-col items-center p-3 glass-dark rounded-xl">
                    <RotateCcw className="w-5 h-5 text-sneakhead-red mb-2" />
                    <span className="text-white text-sm font-medium">Free Returns</span>
                    <span className="text-gray-400 text-xs">30-day policy</span>
                  </div>
                  <div className="flex flex-col items-center p-3 glass-dark rounded-xl">
                    <Shield className="w-5 h-5 text-sneakhead-red mb-2" />
                    <span className="text-white text-sm font-medium">Authentic</span>
                    <span className="text-gray-400 text-xs">Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Quick Features */}
              {product.features && product.features.length > 0 && (
                <div className="glass-dark p-6 rounded-2xl">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-sneakhead-red mr-2" />
                    Key Features
                  </h3>
                  <div className="space-y-3">
                    {product.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 hover:bg-sneakhead-gray rounded-lg transition-colors cursor-pointer"
                        onClick={() => toggleFeature(index)}
                      >
                        <span className="text-gray-300">{feature}</span>
                        {expandedFeatures[index] ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <div className="glass-dark rounded-2xl border border-sneakhead-light-gray overflow-hidden">
              {/* Tab Headers */}
              <div className="flex border-b border-sneakhead-light-gray">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-center transition-colors ${
                      activeTab === tab.id
                        ? 'bg-sneakhead-red text-white'
                        : 'text-gray-400 hover:text-white hover:bg-sneakhead-gray'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'description' && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {product.description || 'Product description will be available soon.'}
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.specifications ? (
                      Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center p-4 bg-sneakhead-gray rounded-xl">
                          <span className="text-gray-400 font-medium">{key}</span>
                          <span className="text-white">{value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-gray-400">
                        <p>Product specifications will be available soon.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'delivery' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-bold text-lg mb-4">Delivery Options</h3>
                      <div className="space-y-4">
                        {product.delivery ? (
                          Object.entries(product.delivery).map(([type, info]) => (
                            <div key={type} className="flex justify-between items-center p-4 bg-sneakhead-gray rounded-xl">
                              <div>
                                <span className="text-white font-medium capitalize">{type} Delivery</span>
                                <p className="text-gray-400 text-sm">{info.days} business days</p>
                              </div>
                              <span className="text-sneakhead-red font-bold">${info.price}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex justify-between items-center p-4 bg-sneakhead-gray rounded-xl">
                              <div>
                                <span className="text-white font-medium">Standard Delivery</span>
                                <p className="text-gray-400 text-sm">5-7 business days</p>
                              </div>
                              <span className="text-sneakhead-red font-bold">$9.99</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-sneakhead-gray rounded-xl">
                              <div>
                                <span className="text-white font-medium">Express Delivery</span>
                                <p className="text-gray-400 text-sm">2-3 business days</p>
                              </div>
                              <span className="text-sneakhead-red font-bold">$19.99</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-white font-bold text-lg mb-4">Returns Policy</h3>
                      <div className="prose prose-invert">
                        <p className="text-gray-300">
                          We offer free returns within 30 days of purchase. Items must be in original condition with all tags attached. 
                          Simply initiate a return through your account and we'll provide a prepaid shipping label.
                        </p>
                      </div>
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>

          {/* Suggested Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white font-grotesk mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedProducts.map((suggestedProduct) => (
                <div key={suggestedProduct.id} className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 hover:border-sneakhead-red/30 transition-all duration-300 group cursor-pointer">
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                    <img
                      src={suggestedProduct.image}
                      alt={suggestedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-white font-medium mb-2">{suggestedProduct.name}</h3>
                  <p className="text-sneakhead-red font-bold">${suggestedProduct.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Login Popup for Guests */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => setShowLoginPopup(false)} 
        type="checkout"
      />
    </div>
  );
};

export default ProductDescription;
