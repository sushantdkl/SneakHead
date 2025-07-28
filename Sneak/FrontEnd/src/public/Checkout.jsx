import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Check,
  Lock,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchCartAndUser = async () => {
      setCartLoading(true);
      setCartError("");
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;
        if (!token || !userId) {
          setCartError('Authentication required');
          setCartLoading(false);
          return;
        }
        
        // Set user data from localStorage
        setUserData(user);
        
        // Fetch cart
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
        setCartError('Failed to fetch cart');
      } finally {
        setCartLoading(false);
      }
    };
    fetchCartAndUser();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setOrderError("");
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
      if (!token || !userId) {
        setOrderError('Authentication required');
        setIsProcessing(false);
        return;
      }
      
      // Prepare order payload
      const orderPayload = {
        userId,
        items: cartItems.map(item => ({
          productId: item.productId || item.Product?.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: parseFloat(item.price)
        })),
        shippingAddress: {
          email: userData.email,
          firstName: userData.name?.split(' ')[0] || 'Customer',
          lastName: userData.name?.split(' ').slice(1).join(' ') || 'User',
          address: 'Default Address',
          city: 'Default City',
          state: 'Default State',
          zipCode: '00000',
          country: 'United States',
          phone: '000-000-0000'
        },
        paymentMethod: {
          type: 'credit_card',
          cardNumber: '****-****-****-****',
          expiryDate: 'MM/YY',
          cvv: '***',
          cardholderName: userData.name || 'Customer'
        },
        deliveryMethod: {
          type: 'standard',
          price: shipping
        },
        subtotal,
        total,
        tax,
        shipping
      };
      
      await orderService.createOrder(orderPayload, token);
      setOrderSuccess(true);
      setIsProcessing(false);
      
      // Clear cart after successful order
      try {
        // Clear cart items one by one
        for (const item of cartItems) {
          await cartService.removeFromCart(userId, item.id, token);
        }
        // Dispatch cart update event to update cart count in navbar
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (cartError) {
        if (cartError.message === 'TOKEN_EXPIRED') {
          // Token expired, logout user and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        console.error('Error clearing cart:', cartError);
        // Don't fail the order if cart clearing fails
      }
    } catch (err) {
      setOrderError(err.message || 'Failed to place order');
      setIsProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-400 mb-4">Your order is being processed for digital delivery! ⚡</p>
          <p className="text-gray-400 mb-6">Admin will approve and deliver within 24 hours</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profile"
              className="btn-glow py-3 px-6 rounded-xl font-semibold inline-block"
            >
              Track Order
            </Link>
            <Link
              to="/"
              className="bg-sneakhead-gray hover:bg-sneakhead-light-gray text-white py-3 px-6 rounded-xl font-semibold inline-block transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                to="/cart"
                className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white font-grotesk">Checkout</h1>
                <p className="text-gray-400">Review your order and complete purchase</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white font-grotesk mb-6">Order Summary</h3>
              
              {/* User Information */}
              {userData && (
                <div className="mb-6 p-4 bg-sneakhead-gray rounded-xl">
                  <h4 className="text-white font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <User className="w-4 h-4 mr-2" />
                      <span>{userData.name}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartLoading ? (
                  <p className="text-gray-400 text-center py-8">Loading cart items...</p>
                ) : cartError ? (
                  <p className="text-red-400 text-center py-8">{cartError}</p>
                ) : cartItems.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-sneakhead-gray rounded-xl">
                      <div className="relative">
                        <img
                          src={item.Product?.images?.[0] || '/src/images/default-product.jpg'}
                          alt={item.Product?.name || 'Product'}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="absolute -top-2 -right-2 bg-sneakhead-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{item.Product?.name}</p>
                        <p className="text-gray-400 text-xs">{item.Product?.brand} • Size {item.size} • {item.color}</p>
                        <p className="text-sneakhead-red font-medium text-sm">${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-3 border-t border-sneakhead-light-gray pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-white">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-sneakhead-light-gray pt-3">
                  <span className="text-white">Total</span>
                  <span className="text-sneakhead-red">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">SSL Secure Checkout</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Truck className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Free Returns & Exchanges</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <ShoppingBag className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Authentic Products Only</span>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="w-5 h-5 text-sneakhead-red" />
                <h2 className="text-xl font-bold text-white font-grotesk">Complete Purchase</h2>
              </div>

              {/* Security Notice */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium text-sm">Secure Payment</p>
                    <p className="text-gray-400 text-sm">Your payment information is encrypted and secure. We never store your card details.</p>
                  </div>
                </div>
              </div>

              {/* Order Error */}
              {orderError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                  <p className="text-red-400 text-sm">{orderError}</p>
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || cartLoading || cartItems.length === 0}
                className="w-full btn-glow py-4 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order - ${total.toFixed(2)}</span>
                  </>
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  By placing your order, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
