import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  X,
  MoreHorizontal,
  Calendar,
  User,
  Edit3,
  Trash2,
  RefreshCw
} from 'lucide-react';

import { orderService } from '../services/orderService';

const OrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await orderService.getAllOrders(token);
      const ordersData = response.data || response;
      console.log('Orders data received:', ordersData); // Debug log
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      await orderService.updateOrderStatus(orderId, { status: newStatus }, token);
      fetchOrders(); // Refresh orders list
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({
          ...prev,
          status: newStatus
        }));
      }
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Note: You might want to add a delete order endpoint to your backend
      // For now, we'll use the cancel order endpoint
      await orderService.cancelOrder(orderId, 'Admin cancelled order', token);
      fetchOrders();
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError('Failed to delete order');
      console.error('Error deleting order:', err);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleRefundRequest = async (orderId) => {
    if (!window.confirm('Are you sure you want to request a refund for this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Update order status to 'refunded' or create a refund request
      await orderService.updateOrderStatus(orderId, { status: 'refunded' }, token);
      fetchOrders(); // Refresh orders list
      
      // Show success message
      alert('Refund request submitted successfully');
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        // Token expired, logout user and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      setError('Failed to submit refund request');
      console.error('Error submitting refund request:', err);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'processing':
        return 'bg-orange-500/20 text-orange-400';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'refunded':
        return 'bg-orange-500/20 text-orange-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Package className="w-4 h-4" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer && order.customer.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer && order.customer.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">


      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black font-grotesk text-white mb-2">Orders</h1>
          <p className="text-gray-400">Manage and track all customer orders</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg focus:border-sneakhead-red outline-none transition-colors text-white placeholder-gray-400"
            />
          </div>
          
          {/* Status Filters */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-sneakhead-black border border-sneakhead-light-gray rounded-lg focus:border-sneakhead-red outline-none transition-colors text-white appearance-none cursor-pointer"
              style={{ backgroundColor: '#0A0A0A' }}
            >
              <option value="all" style={{ backgroundColor: '#0A0A0A', color: 'white' }}>All Orders</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} style={{ backgroundColor: '#0A0A0A', color: 'white' }}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="glass-dark rounded-2xl border border-sneakhead-light-gray overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red mx-auto mb-4"></div>
              <p className="text-gray-400">Loading orders...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sneakhead-light-gray">
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Order ID</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Customer</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Products</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Total</th>
                      <th className="text-left p-6 text-gray-400 font-medium text-sm">Status</th>
                      <th className="text-right p-6 text-gray-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="border-b border-sneakhead-light-gray hover:bg-sneakhead-gray/30 transition-colors group cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="p-6">
                          <span className="text-white font-medium">{order.id}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-sneakhead-red rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {(() => {
                                  const customerName = order.user?.name || order.customer?.name || order.User?.name;
                                  return customerName || 'N/A';
                                })()}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {(() => {
                                  const customerEmail = order.user?.email || order.customer?.email || order.User?.email;
                                  return customerEmail || 'N/A';
                                })()}
                              </p>
                              {(() => {
                                const customerPhone = order.user?.phone || order.customer?.phone || order.User?.phone;
                                return customerPhone && (
                                  <p className="text-gray-500 text-xs">{customerPhone}</p>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center space-x-2">
                            {(order.items || order.products || []).slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <img
                                  src={item.product?.images?.[0] || item.image || '/src/images/default-product.jpg'}
                                  alt={item.product?.name || item.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <span className="text-gray-300 text-sm">
                                  {item.product?.name || item.name}
                                </span>
                              </div>
                            ))}
                            {(order.items || order.products || []).length > 2 && (
                              <span className="text-gray-400 text-sm">
                                +{(order.items || order.products || []).length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center text-gray-300">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(order.createdAt || order.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-white font-semibold">
                            ${(() => {
                              const total = order.totalAmount || order.total;
                              const numTotal = parseFloat(total);
                              return isNaN(numTotal) ? '0.00' : numTotal.toFixed(2);
                            })()}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-2 capitalize">{order.status}</span>
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                            {order.status === 'processing' && (
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
                                title="Approve & Deliver"
                              >
                                Approve
                              </button>
                            )}
                            {order.status === 'delivered' && (
                              <button 
                                onClick={() => handleRefundRequest(order.id)}
                                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition-colors"
                                title="Request Refund"
                              >
                                Refund
                              </button>
                            )}
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className="px-2 py-1 bg-sneakhead-black border border-sneakhead-light-gray rounded text-white text-sm"
                              style={{ backgroundColor: '#0A0A0A' }}
                              title="Update Status"
                            >
                              {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                                <option key={option.value} value={option.value} style={{ backgroundColor: '#0A0A0A', color: 'white' }}>{option.label}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-2 hover:bg-sneakhead-light-gray rounded-lg transition-colors group/btn"
                              title="Delete Order"
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
              {filteredOrders.length === 0 && !loading && (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
                  <p className="text-gray-400">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Orders will appear here when customers start placing them.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-dark rounded-2xl border border-sneakhead-light-gray w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-sneakhead-light-gray">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Order Details</h2>
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      setSelectedOrder(null);
                    }}
                    className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Order ID</label>
                    <p className="text-white font-semibold">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Date</label>
                    <p className="text-white">{new Date(selectedOrder.createdAt || selectedOrder.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Customer Information</label>
                    <div className="bg-sneakhead-gray p-3 rounded-lg">
                      <p className="text-white font-medium">{selectedOrder.user?.name || selectedOrder.customer?.name || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{selectedOrder.user?.email || selectedOrder.customer?.email || 'N/A'}</p>
                      {selectedOrder.user?.phone || selectedOrder.customer?.phone && (
                        <p className="text-gray-400 text-sm">{selectedOrder.user?.phone || selectedOrder.customer?.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-2 capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-4">Order Items</label>
                  <div className="space-y-3">
                    {(selectedOrder.items || selectedOrder.products || []).map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-sneakhead-gray rounded-xl">
                        <img
                          src={item.product?.images?.[0] || item.image || 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          alt={item.product?.name || item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{item.product?.name || item.name}</h4>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${Number(item.product?.price || item.price || 0).toFixed(2)}</p>
                          <p className="text-gray-400 text-sm">Total: ${Number((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">Shipping Address</label>
                    <div className="bg-sneakhead-gray p-3 rounded-lg">
                      {typeof selectedOrder.shippingAddress === 'string' ? (
                        <p className="text-white">{selectedOrder.shippingAddress}</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-white">
                            {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress.address}</p>
                          <p className="text-gray-400 text-sm">
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                          </p>
                          <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress.country}</p>
                          {selectedOrder.shippingAddress.phone && (
                            <p className="text-gray-400 text-sm">Phone: {selectedOrder.shippingAddress.phone}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-sneakhead-light-gray pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-sneakhead-red">${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-gray-400 text-sm font-medium mb-2">Update Status</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl text-white focus:border-sneakhead-red focus:outline-none"
                    >
                      {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
