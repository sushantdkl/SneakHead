import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Package,
  User,
  MessageSquare
} from 'lucide-react';

// import refundService from '../services/refundService'; // Uncomment if you have a refundService

const RefundRequestPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRefunds = async () => {
      setLoading(true);
      setError("");
      try {
        // For now, show empty state since refund system is not fully implemented
        setRefundRequests([]);
        
        // TODO: When refund system is fully implemented, uncomment this code:
        /*
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:3000/api/refunds', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRefundRequests(data.data || []);
        } else {
          throw new Error('Failed to fetch refund requests');
        }
        */
      } catch (err) {
        setError('Failed to fetch refund requests');
        console.error('Error fetching refunds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRefunds();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
        icon: Clock,
        text: 'Pending Review'
      },
      approved: {
        color: 'bg-green-500/20 text-green-400 border-green-400/30',
        icon: CheckCircle,
        text: 'Approved'
      },
      rejected: {
        color: 'bg-red-500/20 text-red-400 border-red-400/30',
        icon: XCircle,
        text: 'Rejected'
      }
    };
    return configs[status] || configs.pending;
  };

  // Filter refunds
  const filteredRefunds = refundRequests.filter(refund => {
    const matchesSearch = 
      refund.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.orderId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (refund.productName && refund.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (refund, action) => {
    setSelectedRefund(refund);
    setSelectedAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/refunds/${selectedRefund.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: selectedAction,
          adminNotes: `Admin ${selectedAction} this refund request`
        })
      });

      if (response.ok) {
        alert(`Refund request ${selectedAction} successfully`);
        // Refresh the refund requests list
        window.location.reload();
      } else {
        throw new Error('Failed to update refund status');
      }
    } catch (error) {
      console.error('Error updating refund status:', error);
      alert('Failed to update refund status');
    } finally {
      setShowConfirmModal(false);
      setSelectedRefund(null);
      setSelectedAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-grotesk text-white mb-2">Refund Requests</h1>
        <p className="text-gray-400">Review and manage customer refund requests</p>
      </div>
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search refunds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-colors text-white placeholder-gray-400"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white appearance-none cursor-pointer"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Refund Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
            <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-white mb-2">Loading refund requests...</h3>
              <p className="text-gray-400">Please wait while we fetch the refund requests.</p>
            </div>
          ) : error ? (
            <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Error: {error}</h3>
              <p className="text-gray-400">Failed to load refund requests. Please try again later.</p>
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No refund requests found</h3>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No refund requests have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            filteredRefunds.map((refund) => {
              const statusConfig = getStatusConfig(refund.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={refund.id} className="glass-dark p-6 rounded-2xl border border-sneakhead-light-gray hover:border-sneakhead-red/30 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white font-grotesk">{refund.id}</h3>
                      <p className="text-gray-400 text-sm">Order: {refund.orderId}</p>
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(refund.requestDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.text}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center space-x-4 mb-6 p-4 bg-sneakhead-gray rounded-xl">
                    <div className="w-12 h-12 bg-sneakhead-red rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {refund.customerName}
                      </h4>
                      <p className="text-gray-400 text-sm">{refund.customerEmail}</p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-start space-x-4 mb-6 p-4 bg-sneakhead-gray rounded-xl">
                    <div className="w-16 h-16 bg-sneakhead-gray border border-sneakhead-light-gray rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">
                        {refund.refundType === 'product' ? (refund.productName || 'Product') : 'Entire Order'}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Package className="w-4 h-4 mr-1" />
                          Type: {refund.refundType}
                        </div>
                        <div className="flex items-center text-sneakhead-red font-semibold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${parseFloat(refund.refundAmount).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        Order Total: ${parseFloat(refund.orderTotal).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Refund Reason */}
                  <div className="mb-6 p-4 bg-sneakhead-light-gray rounded-xl">
                    <div className="flex items-start">
                      <MessageSquare className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-white font-medium mb-2">Refund Reason</h5>
                        <p className="text-gray-300 text-sm leading-relaxed">{refund.reason}</p>
                      </div>
                    </div>
                  </div>



                  {/* Resolution Info */}
                  {refund.status !== 'pending' && refund.adminNotes && (
                    <div className="mb-6 p-4 bg-sneakhead-gray rounded-xl">
                      <h5 className="text-white font-medium mb-2">Resolution</h5>
                      <div className="text-gray-400 text-sm">
                        <p>Resolved on: {new Date(refund.resolvedDate).toLocaleDateString()}</p>
                        {refund.rejectionReason && (
                          <p className="mt-2">Reason: {refund.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {refund.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAction(refund, 'approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center animate-pulse-glow"
                        style={{ boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)' }}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Approve Refund
                      </button>
                      <button
                        onClick={() => handleAction(refund, 'reject')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && selectedRefund && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
              
              <div className="relative glass-dark p-8 rounded-2xl border border-sneakhead-light-gray max-w-md w-full">
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    selectedAction === 'approve' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {selectedAction === 'approve' ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 font-grotesk">
                    {selectedAction === 'approve' ? 'Approve Refund' : 'Reject Refund'}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    Are you sure you want to {selectedAction} refund request {selectedRefund.id}?
                    {selectedAction === 'approve' && (
                      <span className="block mt-2 text-sm">
                        Amount: ${selectedRefund.amount.toFixed(2)}
                      </span>
                    )}
                  </p>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 px-6 py-3 border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAction}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors ${
                        selectedAction === 'approve'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {selectedAction === 'approve' ? 'Approve' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default RefundRequestPage;
