import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Clock,
  CheckCircle,
  Truck,
  X,
  Star,
  Calendar,
  DollarSign,
  ShoppingBag,
  Award,
  Shield
} from 'lucide-react';
import { orderService } from '../services/orderService';
import UserLayout from '../components/UserLayout';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser || {});
    
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        const userId = storedUser?.id;
        if (!userId) {
          setError('User not found');
          setLoading(false);
          return;
        }
        const response = await orderService.getUserOrders(userId, token);
        setOrders(response.data || response);
      } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    if (storedUser) fetchOrders();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      'pending': {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
        icon: Clock,
        text: 'Pending'
      },
      'processing': {
        color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
        icon: Package,
        text: 'Processing'
      },
      'shipped': {
        color: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
        icon: Truck,
        text: 'Shipped'
      },
      'delivered': {
        color: 'bg-green-500/20 text-green-400 border-green-400/30',
        icon: CheckCircle,
        text: 'Delivered'
      },
      'cancelled': {
        color: 'bg-red-500/20 text-red-400 border-red-400/30',
        icon: X,
        text: 'Cancelled'
      }
    };
    return configs[status?.toLowerCase()] || configs['pending'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateOrderStats = () => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => {
      const amount = parseFloat(order.totalAmount) || 0;
      return sum + amount;
    }, 0);
    const deliveredOrders = orders.filter(order => order.status?.toLowerCase() === 'delivered').length;
    const pendingOrders = orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status?.toLowerCase())).length;

    return { totalOrders, totalSpent, deliveredOrders, pendingOrders };
  };

  const stats = calculateOrderStats();

  return (
    <UserLayout title="My Profile" subtitle="Manage your account and view order history">
      <div className="space-y-8">
        {/* User Information Card */}
        <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-sneakhead-red to-red-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black font-grotesk text-white mb-2">
                {user.name || 'User'}
              </h2>
              <p className="text-gray-400 text-lg mb-1">{user.email}</p>
              <p className="text-gray-500 text-sm">Member since {formatDate(user.createdAt || new Date())}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Verified Account</span>
            </div>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">{stats.totalOrders}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total Orders</h3>
          </div>

          <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">{stats.deliveredOrders}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Delivered</h3>
          </div>

          <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">{stats.pendingOrders}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">In Progress</h3>
          </div>

          <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">${stats.totalSpent.toLocaleString()}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total Spent</h3>
          </div>
        </div>

        {/* Order History */}
        <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black font-grotesk text-white mb-2">Order History</h3>
              <p className="text-gray-400">Track your recent purchases and deliveries</p>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Loyalty Member</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red"></div>
              <span className="ml-4 text-gray-400">Loading your orders...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
              <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-400 mb-2">No Orders Yet</h4>
              <p className="text-gray-500 mb-6">Start shopping to see your order history here</p>
              <button className="bg-sneakhead-red hover:bg-sneakhead-red-light text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={order.id} className="bg-sneakhead-black border border-sneakhead-light-gray rounded-xl p-6 hover:border-sneakhead-red/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg border ${statusConfig.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Order #{order.id}</h4>
                          <p className="text-gray-400 text-sm">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                                             <div className="text-right">
                         <p className="text-sneakhead-red font-bold text-lg">${(parseFloat(order.totalAmount) || 0).toFixed(2)}</p>
                         <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                           {statusConfig.text}
                         </span>
                       </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-sneakhead-gray rounded-lg">
                            <img
                              src={item.image || '/src/images/default-product.jpg'}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-gray-400 text-sm">Qty: {item.quantity} • Size: {item.size}</p>
                            </div>
                                                         <p className="text-sneakhead-red font-bold">${(parseFloat(item.price) || 0).toFixed(2)}</p>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-gray-400 text-sm text-center">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    )}

                    {/* Order Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-sneakhead-light-gray">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400 text-sm">Rate your experience</span>
                      </div>
                      <button className="bg-sneakhead-red hover:bg-sneakhead-red-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;