import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  X, 
  Eye, 
  RotateCcw,
  Calendar,
  Filter,
  ChevronDown,
  MapPin,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import UserLayout from '../components/UserLayout';
import { orderService } from '../services/orderService';

const MyOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
        // You may want to get userId from localStorage user object
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;
        if (!userId) {
          setError('User not found');
          setLoading(false);
          return;
        }
        const response = await orderService.getUserOrders(userId, token);
        setOrders(response.data || response);
      } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') {
          // Token expired, logout user and redirect to login
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
    fetchOrders();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      processing: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
        icon: Clock,
        text: 'Processing'
      },
      shipped: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
        icon: Truck,
        text: 'Shipped'
      },
      delivered: {
        color: 'bg-green-500/20 text-green-400 border-green-400/30',
        icon: CheckCircle,
        text: 'Delivered'
      },
      cancelled: {
        color: 'bg-red-500/20 text-red-400 border-red-400/30',
        icon: X,
        text: 'Cancelled'
      }
    };
    return configs[status] || configs.processing;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const orderIdString = String(order.id || '');
    const matchesSearch = 
      orderIdString.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.products && order.products.some(product => 
        product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleTrackOrder = (trackingNumber) => {
    // Open tracking in new window
    window.open(`https://tracking-service.com/${trackingNumber}`, '_blank');
  };

  const handleReorder = (order) => {
    console.log('Reordering:', order.id);
    // Handle reorder logic
  };

  const handleRefundRequest = async (order, product = null) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      alert('Please login to submit a refund request.');
      return;
    }

    const confirmMessage = product 
      ? `Are you sure you want to request a refund for ${product.name}?`
      : 'Are you sure you want to request a refund for this entire order?';

    if (window.confirm(confirmMessage)) {
      try {
        const token = localStorage.getItem('token');
        const refundData = {
          orderId: order.id,
          userId: user.id,
          customerName: user.name,
          customerEmail: user.email,
          status: 'pending',
          requestDate: new Date().toISOString(),
          refundType: product ? 'product' : 'order',
          productId: product ? (product.id || product.productId) : null,
          productName: product ? product.name : null,
          orderTotal: order.totalAmount || order.total,
          refundAmount: product ? (parseFloat(product.price) * (product.quantity || 1)) : (order.totalAmount || order.total),
          reason: 'Customer requested refund'
        };

        const response = await fetch('http://localhost:3000/api/refunds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(refundData)
        });

        if (response.ok) {
          alert(product 
            ? `Refund request submitted for ${product.name}. Our team will review your request.`
            : 'Refund request submitted for this order. Our team will review your request.'
          );
        } else {
          throw new Error('Failed to submit refund request');
        }
      } catch (error) {
        console.error('Error submitting refund request:', error);
        alert('Failed to submit refund request. Please try again later.');
      }
    }
    // If user clicks "No" or cancels, they stay on the same page (no navigation)
  };

  return (
    <UserLayout title="My Orders" subtitle="Track your orders and view purchase history">
      <div className="space-y-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-sneakhead-black border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white appearance-none cursor-pointer transition-colors"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-sneakhead-black">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red mx-auto mb-4"></div>
              <p className="text-gray-400">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={order.id} className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 hover:border-sneakhead-red/30 transition-all duration-300">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-bold text-white font-grotesk">{order.id}</h3>
                        <div className="flex items-center text-gray-400 text-sm mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {order.date ? new Date(order.date).toLocaleDateString() : 
                           order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 
                           'Date not available'}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.text}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-bold text-sneakhead-red">${(parseFloat(order.totalAmount || order.total) || 0).toFixed(2)}</span>
                      <div className="flex space-x-2">
                        {order.trackingNumber && (
                          <button
                            onClick={() => handleTrackOrder(order.trackingNumber)}
                            className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors group"
                            title="Track Order"
                          >
                            <Truck className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors group"
                            title="Reorder"
                          >
                            <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" />
                          </button>
                        )}
                                                    {order.status === 'delivered' && (
                              <button
                                onClick={() => handleRefundRequest(order)}
                                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition-colors flex items-center space-x-1"
                                title="Request Refund"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refund</span>
                              </button>
                            )}
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="space-y-3">
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-sneakhead-gray rounded-xl">
                          <img
                            src={product.image || '/src/images/default-product.jpg'}
                            alt={product.name || 'Product'}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{product.name || 'Product'}</h4>
                            <div className="flex items-center space-x-4 text-gray-400 text-sm mt-1">
                              <span>Size: {product.size || 'N/A'}</span>
                              <span>Color: {product.color || 'N/A'}</span>
                              <span>Qty: {product.quantity || 0}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">${(parseFloat(product.price) || 0).toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">each</p>
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => handleRefundRequest(order, product)}
                                className="mt-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
                                title="Request Refund for this product"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Refund</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-sneakhead-gray rounded-xl text-center">
                        <p className="text-gray-400">No product details available</p>
                      </div>
                    )}
                  </div>

                  {/* Tracking Info */}
                  {order.trackingNumber && (
                    <div className="mt-4 p-4 bg-sneakhead-light-gray rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">Tracking Number</p>
                          <p className="text-gray-400 text-sm">{order.trackingNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {order.status === 'delivered' ? 'Delivered' : 'Expected Delivery'}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {order.actualDelivery 
                              ? new Date(order.actualDelivery).toLocaleDateString()
                              : new Date(order.estimatedDelivery).toLocaleDateString()
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowOrderDetails(false)} />
              
              <div className="relative glass-dark p-8 rounded-2xl border border-sneakhead-light-gray max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white font-grotesk">Order Details</h2>
                    <p className="text-gray-400">Order ID: {selectedOrder.id}</p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Order Status */}
                <div className="mb-6 p-6 bg-sneakhead-gray rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Order Status</h3>
                    {(() => {
                      const statusConfig = getStatusConfig(selectedOrder.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <span className={`inline-flex items-center px-4 py-2 rounded-full font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {statusConfig.text}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Order Date</p>
                      <p className="text-white">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div>
                        <p className="text-gray-400">Tracking Number</p>
                        <p className="text-white">{selectedOrder.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-4">Products</h3>
                  <div className="space-y-4">
                    {selectedOrder.products && selectedOrder.products.length > 0 ? (
                      selectedOrder.products.map((product, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-sneakhead-gray rounded-xl">
                          <img
                            src={product.image || '/src/images/default-product.jpg'}
                            alt={product.name || 'Product'}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{product.name || 'Product'}</h4>
                            <div className="grid grid-cols-3 gap-2 text-gray-400 text-sm mt-2">
                              <span>Size: {product.size || 'N/A'}</span>
                              <span>Color: {product.color || 'N/A'}</span>
                              <span>Qty: {product.quantity || 0}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">${(parseFloat(product.price) || 0).toFixed(2)}</p>
                            <p className="text-gray-400 text-sm">each</p>
                            {selectedOrder.status === 'delivered' && (
                              <button
                                onClick={() => handleRefundRequest(selectedOrder, product)}
                                className="mt-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors flex items-center space-x-1"
                                title="Request Refund for this product"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Refund</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-sneakhead-gray rounded-xl text-center">
                        <p className="text-gray-400">No product details available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-sneakhead-gray rounded-xl">
                    <div className="flex items-center mb-3">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <h4 className="text-white font-medium">Shipping Address</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedOrder.shippingAddress}</p>
                  </div>
                  
                  <div className="p-4 bg-sneakhead-gray rounded-xl">
                    <div className="flex items-center mb-3">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                      <h4 className="text-white font-medium">Payment Method</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t border-sneakhead-light-gray pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total:</span>
                    <span className="text-xl font-bold text-sneakhead-red">${(parseFloat(selectedOrder.total) || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 mt-6">
                  {selectedOrder.trackingNumber && (
                    <button
                      onClick={() => handleTrackOrder(selectedOrder.trackingNumber)}
                      className="flex-1 btn-glow py-3"
                    >
                      Track Order
                    </button>
                  )}
                  {selectedOrder.status === 'delivered' && (
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      className="flex-1 px-6 py-3 border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                    >
                      Reorder
                    </button>
                  )}
                  {selectedOrder.status === 'delivered' && (
                    <button
                      onClick={() => handleRefundRequest(selectedOrder)}
                      className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors flex items-center justify-center space-x-2 font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Request Refund</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : "You haven't placed any orders yet."
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button className="btn-glow px-8 py-3">
                Start Shopping
              </button>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyOrders;
