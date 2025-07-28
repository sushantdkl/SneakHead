import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Truck, 
  Shield,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import LoginPopup from '../components/LoginPopup';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;
        if (!token || !userId) {
          setShowLoginPopup(true);
          setLoading(false);
          return;
        }
        const response = await cartService.getCart(userId, token);
        setCartItems(response.data?.CartItems || response.data?.items || response.items || []);
      } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') {
          // Token expired, logout user and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError('Failed to fetch cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      const fetchCart = async () => {
        setLoading(true);
        setError("");
        try {
          const token = localStorage.getItem('token');
          const user = JSON.parse(localStorage.getItem('user'));
          const userId = user?.id;
          if (!token || !userId) {
            setLoading(false);
            return;
          }
          const response = await cartService.getCart(userId, token);
          setCartItems(response.data?.CartItems || response.data?.items || response.items || []);
        } catch (err) {
          if (err.message === 'TOKEN_EXPIRED') {
            // Token expired, logout user and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }
          setError('Failed to fetch cart');
        } finally {
          setLoading(false);
        }
      };
      fetchCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(10, newQuantity)) } : item
      )
    );
  };

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      if (!token || !userId) {
        setError('Authentication required');
        return;
      }
      await cartService.removeFromCart(userId, id, token);
      setCartItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError('Failed to remove item from cart');
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const savings = cartItems.reduce((sum, item) => sum + ((parseFloat(item.Product?.originalPrice || 0) - parseFloat(item.price)) * item.quantity), 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-black">
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white font-grotesk mb-2">Shopping Cart</h1>
            <p className="text-gray-400">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red mx-auto mb-4"></div>
              <p className="text-gray-400">Loading cart...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.length === 0 ? (
                  /* Empty Cart */
                  <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 mb-6">Looks like you haven't added any sneakers to your cart yet.</p>
                    <Link
                      to="/"
                      className="inline-flex items-center btn-glow px-8 py-3"
                    >
                      Continue Shopping
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`glass-dark border border-sneakhead-light-gray rounded-2xl p-6 transition-all duration-300 ${
                        !item.Product?.isActive ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.Product?.images?.[0] || '/src/images/default-product.jpg'}
                            alt={item.Product?.name || 'Product'}
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                          {!item.Product?.isActive && (
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-gray-400 text-sm">{item.Product?.brand}</p>
                              <h3 className="text-white font-semibold">{item.Product?.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                <span>Size: {item.size}</span>
                                <span>Color: {item.color}</span>
                              </div>
                            </div>
                            
                            {/* Price */}
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className="text-sneakhead-red font-bold">${parseFloat(item.price).toFixed(2)}</span>
                                {parseFloat(item.Product?.originalPrice || 0) > parseFloat(item.price) && (
                                  <span className="text-gray-500 line-through text-sm">${parseFloat(item.Product?.originalPrice || 0).toFixed(2)}</span>
                                )}
                              </div>
                              {parseFloat(item.Product?.originalPrice || 0) > parseFloat(item.price) && (
                                <span className="text-green-400 text-xs">
                                  Save ${(parseFloat(item.Product?.originalPrice || 0) - parseFloat(item.price)).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity */}
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center border border-sneakhead-light-gray rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-sneakhead-gray transition-colors"
                                  disabled={!item.Product?.isActive}
                                >
                                  <Minus className="w-4 h-4 text-white" />
                                </button>
                                <span className="px-4 py-2 text-white font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-2 hover:bg-sneakhead-gray transition-colors"
                                  disabled={!item.Product?.isActive}
                                >
                                  <Plus className="w-4 h-4 text-white" />
                                </button>
                              </div>
                              <span className="text-gray-400 text-sm">
                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Item Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors group"
                                title="Remove from Cart"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                              </button>
                            </div>
                          </div>

                          {!item.Product?.isActive && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <p className="text-red-400 text-sm">This item is currently out of stock and will be removed at checkout.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Continue Shopping */}
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary - Sticky */}
              <div className="lg:col-span-1">
                <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 sticky top-28">
                  <h3 className="text-xl font-bold text-white font-grotesk mb-6">Order Summary</h3>
                  
                  {/* Order Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {savings > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Savings</span>
                        <span className="text-green-400 font-medium">-${savings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white font-medium">
                        {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    
                    {shipping > 0 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          Add ${(100 - subtotal).toFixed(2)} more for free shipping
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t border-sneakhead-light-gray pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total</span>
                      <span className="text-xl font-bold text-sneakhead-red">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="w-full btn-glow py-4 text-lg font-semibold mb-4 block text-center"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </Link>

                  {/* Security Features */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <Truck className="w-4 h-4 text-sneakhead-red" />
                      <span className="text-gray-300">Free shipping on orders over $100</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Shield className="w-4 h-4 text-sneakhead-red" />
                      <span className="text-gray-300">Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Gift className="w-4 h-4 text-sneakhead-red" />
                      <span className="text-gray-300">Free returns within 30 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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

export default Cart;
