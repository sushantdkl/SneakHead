import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  RefreshCw,
  Eye,
  MoreHorizontal,
  Star,
  Users
} from 'lucide-react';

import { orderService } from '../services/orderService';
import { productService } from '../services/productService';

const AdminDashboard = () => {

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        // Fetch orders, products, and calculate stats
        const [ordersRes, productsRes] = await Promise.all([
          orderService.getAllOrders({}, token),
          productService.getAllProducts({ limit: 100 })
        ]);
        
        const orders = ordersRes.data || ordersRes || [];
        const products = productsRes.data || productsRes.products || productsRes || [];
        
        setRecentOrders(orders.slice(0, 5));
        setTopProducts(products.slice(0, 4));
        
        // Calculate stats
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        setStats({
          totalOrders: orders.length,
          totalRevenue: totalRevenue,
          totalProducts: products.length,
          totalUsers: Math.floor(orders.length * 0.8) // Mock user count
        });
      } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') {
          // Token expired, logout user and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        console.error('Dashboard data fetch error:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white">{error}</p>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black font-grotesk text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with SNEAKHEAD today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="glass-dark p-6 rounded-2xl border border-sneakhead-light-gray hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm">Total Revenue</p>
          </div>

          <div className="glass-dark p-6 rounded-2xl border border-sneakhead-light-gray hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalOrders}</h3>
            <p className="text-gray-400 text-sm">Total Orders</p>
          </div>

          <div className="glass-dark p-6 rounded-2xl border border-sneakhead-light-gray hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalProducts}</h3>
            <p className="text-gray-400 text-sm">Total Products</p>
          </div>

          <div className="glass-dark p-6 rounded-2xl border border-sneakhead-light-gray hover:border-sneakhead-red/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stats.totalUsers}</h3>
            <p className="text-gray-400 text-sm">Total Users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="glass-dark p-6 rounded-2xl border border-sneakhead-light-gray">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white font-grotesk">Recent Orders</h3>
                <p className="text-gray-400 text-sm">Latest customer purchases</p>
              </div>
              <Link to="/admin/orders" className="text-sneakhead-red hover:text-sneakhead-red-light text-sm font-medium transition-colors">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center p-3 rounded-xl hover:bg-sneakhead-gray transition-colors group cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-sneakhead-red to-sneakhead-red-light rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {order.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium text-sm">
                          {order.user?.name || `Order #${order.orderNumber || order.id}`}
                        </p>
                        <span className="text-white font-bold text-sm">${order.totalAmount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-400 text-xs">#{order.orderNumber || order.id}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="ml-3 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-400">No orders yet</p>
                  <p className="text-gray-500 text-sm">Orders will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="glass-dark p-6 rounded-2xl border border-sneakhead-light-gray">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white font-grotesk">Top Products</h3>
              <p className="text-gray-400 text-sm">Best performing sneakers this month</p>
            </div>
            <Link to="/admin/products" className="text-sneakhead-red hover:text-sneakhead-red-light text-sm font-medium transition-colors">
              View All Products
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="bg-sneakhead-gray p-4 rounded-xl border border-sneakhead-light-gray hover:border-sneakhead-red/30 transition-all duration-300 group cursor-pointer">
                  <div className="relative mb-3">
                    <img
                      src={product.images?.[0] || product.image || '/src/images/default-product.jpg'}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-white text-xs font-medium">{product.rating || '4.5'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-sneakhead-red transition-colors">
                    {product.name}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="text-white font-bold">${product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Stock</p>
                      <p className="text-sneakhead-red font-bold">{product.stockQuantity || 0}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No products yet</p>
                <p className="text-gray-500 text-sm">Products will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default AdminDashboard;
