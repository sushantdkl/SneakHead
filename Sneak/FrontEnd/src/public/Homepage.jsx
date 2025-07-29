import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Heart, ArrowRight, ChevronLeft, ChevronRight, Play, ShoppingCart, Zap } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";

// Homepage component with hero section and product showcase
const Homepage = () => {
  const { isLoggedIn, user } = useAuth();
  const [currentReview, setCurrentReview] = useState(0);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});



  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch general products and featured products
        const [productsData, featuredData] = await Promise.all([
          productService.getAllProducts({ limit: 8 }),
          productService.getFeaturedProducts()
        ]);
        
        const products = productsData.data || productsData.products || productsData || [];
        const featured = featuredData.data || featuredData.products || featuredData || [];
        
        setProducts(products);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data if backend fails
        setProducts(mockProducts || []);
        setFeaturedProducts(mockProducts ? mockProducts.slice(0, 4) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle add to cart
  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      await cartService.addToCart(userData.id, {
        productId: product.id,
        quantity: 1,
        size: product.availableSizes?.[0] || '9', // Default to first available size
        color: product.availableColors?.[0] || 'Black' // Default to first available color
      }, token);
      
      alert('Product added to cart successfully!');
      
      // Dispatch cart update event to update navigation cart count
      window.dispatchEvent(new Event('cartUpdated'));
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

  // Mock data as fallback
  const mockProducts = [
    {
      id: 1,
      name: "Air Jordan 1 Retro High",
      price: 199.99,
      originalPrice: 249.99,
      image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.8,
      brand: "Jordan",
      category: "basketball",
      reviews: 245
    },
    {
      id: 2,
      name: "Nike Dunk Low",
      price: 159.99,
      originalPrice: 199.99,
      image: "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.6,
      brand: "Nike",
      category: "lifestyle",
      reviews: 189
    },
    {
      id: 3,
      name: "Yeezy Boost 350",
      price: 229.99,
      originalPrice: 279.99,
      image: "https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 4.9,
      brand: "Adidas",
      category: "streetwear",
      reviews: 332
    },
    {
      id: 4,
      name: "Travis Scott Jordan",
      price: 459.99,
      originalPrice: 519.99,
      image: "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=400",
      rating: 5.0,
      brand: "Jordan",
      category: "limited",
      reviews: 98
    }
  ];

  // Single hero data
  const heroData = {
    title: "DRIP STARTS HERE",
    subtitle: "STREET ROYALTY",
    description: "Elevate your street style with our premium sneaker collection. Make every step count.",
    image: "/src/images/HomepageBG.png",
    price: "$159.99",
    originalPrice: "$199.99",
    cta: "EXPLORE COLLECTION"
  };

  // Categories
  const categories = [
    {
      name: "Basketball",
      description: "Court-ready performance",
      image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: 247,
      path: "/category/basketball"
    },
    {
      name: "Streetwear",
      description: "Urban culture essentials",
      image: "https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: 189,
      path: "/category/streetwear"
    },
    {
      name: "Casual",
      description: "Everyday comfort",
      image: "https://images.pexels.com/photos/1407354/pexels-photo-1407354.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: 156,
      path: "/category/casual"
    },
    {
      name: "Limited Edition",
      description: "Exclusive releases",
      image: "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=400",
      count: 23,
      path: "/category/limited"
    }
  ];

  // Customer reviews
  const reviews = [
    {
      id: 1,
      name: "Marcus Johnson",
      avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100",
      rating: 5,
      comment: "SNEAKHEAD is the real deal! Got my Jordan 1s delivered in 2 days and the quality is unmatched. This is my go-to for all things sneakers.",
      product: "Air Jordan 1 Retro High",
      date: "2 days ago"
    },
    {
      id: 2,
      name: "Sarah Chen",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
      rating: 5,
      comment: "The exclusive drops here are insane! Managed to cop the Travis Scott collab thanks to their notification system. Customer service is top tier.",
      product: "Travis Scott x Air Jordan 1",
      date: "1 week ago"
    },
    {
      id: 3,
      name: "Alex Rivera",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      rating: 5,
      comment: "Been shopping here for years and they never disappoint. Authentic products, fast shipping, and the SNEAKHEAD community is amazing!",
      product: "Nike Dunk Low",
      date: "3 weeks ago"
    }
  ];



  // Auto-advance reviews carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <div className="min-h-screen bg-sneakhead-black text-white">
      
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroData.image}
            alt={heroData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-sneakhead-red/20 border border-sneakhead-red text-sneakhead-red text-sm font-bold rounded-full mb-4 animate-pulse">
                  {heroData.subtitle}
                </span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black font-grotesk mb-6 leading-none">
                <span className="text-gradient">{heroData.title}</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {heroData.description}
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-black text-sneakhead-red">
                    {heroData.price}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {heroData.originalPrice}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn-glow px-8 py-4 text-lg font-bold tracking-wide"
                >
                  {heroData.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* Featured Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-grotesk mb-4">
              Featured <span className="text-gradient">Categories</span>
            </h2>
            <p className="text-gray-400 text-lg">Discover your style across our premium collections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="group relative overflow-hidden rounded-2xl aspect-square bg-sneakhead-gray border border-sneakhead-light-gray hover:border-sneakhead-red transition-all duration-500"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-sneakhead-red transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{category.description}</p>
                  <span className="text-sneakhead-red text-sm font-semibold">{category.count} Products</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black font-grotesk mb-4">
                Featured <span className="text-gradient">Products</span>
              </h2>
              <p className="text-gray-400 text-lg">Handpicked favorites from our collection</p>
            </div>
            <Link to="/products" className="group flex items-center text-sneakhead-red hover:text-sneakhead-red-light transition-colors font-semibold">
              View All
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-sneakhead-gray border border-sneakhead-light-gray rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full h-64 bg-sneakhead-light-gray"></div>
                  <div className="p-6">
                    <div className="h-4 bg-sneakhead-light-gray rounded mb-2"></div>
                    <div className="h-6 bg-sneakhead-light-gray rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-sneakhead-light-gray rounded w-20"></div>
                      <div className="h-8 bg-sneakhead-light-gray rounded w-8"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              (Array.isArray(featuredProducts) ? featuredProducts : []).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="bg-sneakhead-gray border border-sneakhead-light-gray rounded-2xl overflow-hidden hover:border-sneakhead-red transition-all duration-500 product-card group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0] || '/src/images/default-product.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isFeatured && (
                        <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-2 py-1 text-xs font-bold rounded-md">
                          FEATURED
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-sneakhead-red text-white px-2 py-1 text-xs font-bold rounded-md">
                          NEW
                        </span>
                      )}
                      {product.isLimited && (
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 text-xs font-bold rounded-md">
                          LIMITED
                        </span>
                      )}
                      {product.originalPrice && product.price < product.originalPrice && (
                        <span className="bg-green-500 text-white px-2 py-1 text-xs font-bold rounded-md">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2 bg-black/50 hover:bg-sneakhead-red rounded-full transition-colors">
                        <Heart className="w-4 h-4 text-white" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={addingToCart[product.id]}
                        className="p-2 bg-sneakhead-red hover:bg-sneakhead-red-light rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        title="Add to Cart"
                      >
                        {addingToCart[product.id] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <ShoppingCart className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 font-medium">{product.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sneakhead-red transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-3">{product.brand}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-sneakhead-red">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <Zap className="w-4 h-4 text-yellow-400" />
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={addingToCart[product.id]}
                      className="w-full bg-sneakhead-red hover:bg-sneakhead-red-light text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold"
                    >
                      {addingToCart[product.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 bg-gradient-to-r from-sneakhead-gray to-sneakhead-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-black font-grotesk mb-6">
                  The <span className="text-gradient">SNEAKHEAD</span> Story
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  Born from a passion for sneaker culture, SNEAKHEAD is more than just a store – 
                  we're a community. We understand that every pair tells a story, every step makes a statement.
                </p>
                <p className="text-gray-400 leading-relaxed mb-8">
                  From the streets of Los Angeles to sneakerheads worldwide, we've curated the most 
                  authentic, premium collection of footwear that speaks to your soul. Join thousands 
                  of sneaker enthusiasts who trust SNEAKHEAD for their next grail.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-sneakhead-red mb-2">50K+</div>
                  <div className="text-gray-400 font-medium">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-sneakhead-red mb-2">500+</div>
                  <div className="text-gray-400 font-medium">Premium Brands</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-sneakhead-red mb-2">24/7</div>
                  <div className="text-gray-400 font-medium">Customer Support</div>
                </div>
              </div>
              
              <Link to="/about" className="btn-glow inline-block px-8 py-4">
                Learn More
              </Link>
            </div>
            
            <div className="relative">
              <img
                src="/src/images/Logo.png"
                alt="SNEAKHEAD Collection"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-sneakhead-red rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white font-black text-lg">NEW</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black font-grotesk mb-4">
              What Our <span className="text-gradient">Sneakerheads</span> Say
            </h2>
            <p className="text-gray-400 text-lg">Real reviews from real sneaker enthusiasts</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentReview * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div key={review.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-sneakhead-gray border border-sneakhead-light-gray rounded-2xl p-8 text-center">
                      <div className="flex justify-center mb-4">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      
                      <p className="text-gray-300 text-lg leading-relaxed mb-6">
                        "{review.comment}"
                      </p>
                      
                      <div className="flex items-center justify-center space-x-4">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="text-left">
                          <div className="font-bold text-white">{review.name}</div>
                          <div className="text-sm text-gray-400">
                            Purchased {review.product} • {review.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentReview(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentReview 
                      ? 'bg-sneakhead-red scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Homepage;
