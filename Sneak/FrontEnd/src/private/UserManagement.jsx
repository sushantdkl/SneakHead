import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Shield,
  UserCheck,
  UserX,
  Edit3,
  Trash2,
  MoreVertical,
  Filter,
  Download
} from 'lucide-react';

import { userService } from '../services/userapi.js';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'delete'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        const response = await userService.getUsers(token);
        setUsers(response.data || response);
      } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') {
          // Token expired, logout user and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        color: 'bg-green-500/20 text-green-400 border-green-400/30',
        icon: UserCheck,
        text: 'Active'
      },
      inactive: {
        color: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
        icon: User,
        text: 'Inactive'
      },
      suspended: {
        color: 'bg-red-500/20 text-red-400 border-red-400/30',
        icon: UserX,
        text: 'Suspended'
      }
    };
    return configs[status] || configs.active;
  };

  const getRoleConfig = (role) => {
    const configs = {
      admin: {
        color: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
        icon: Shield,
        text: 'Admin'
      },
      customer: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
        icon: User,
        text: 'Customer'
      }
    };
    return configs[role] || configs.customer;
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const openUserModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setModalType('view');
  };

  const handleUserAction = async (action, userId) => {
    if (action === 'delete') {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required');
          return;
        }
        
        const confirmed = window.confirm('Are you sure you want to delete this user? This action cannot be undone.');
        if (!confirmed) {
          return;
        }
        
        await userService.deleteUser(userId, token);
        
        // Remove the user from the local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        
        alert('User deleted successfully');
      } catch (err) {
        if (err.message === 'TOKEN_EXPIRED') {
          // Token expired, logout user and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  return (
      <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black font-grotesk text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage customer accounts and admin users</p>
      </div>
        {/* Header Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-sneakhead-black border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white appearance-none cursor-pointer"
                style={{ backgroundColor: '#0A0A0A' }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ backgroundColor: '#0A0A0A', color: 'white' }}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-sneakhead-black border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none transition-colors text-white appearance-none cursor-pointer"
                style={{ backgroundColor: '#0A0A0A' }}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value} style={{ backgroundColor: '#0A0A0A', color: 'white' }}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          

        </div>

        {/* Users Table */}
        <div className="glass-dark rounded-2xl border border-sneakhead-light-gray overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sneakhead-red mx-auto mb-4"></div>
                <p className="text-gray-400">Loading users...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-sneakhead-gray">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">User</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Role</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Orders</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Total Spent</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Last Login</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sneakhead-light-gray">
                  {filteredUsers.map((user) => {
                    const statusConfig = getStatusConfig(user.status);
                    const StatusIcon = statusConfig.icon;
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;
                    
                    return (
                      <tr key={user.id} className="hover:bg-sneakhead-gray/50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${roleConfig.color}`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleConfig.text}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-white">
                            <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                            {user.totalOrders}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-sneakhead-red font-semibold">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {(user.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-400 text-sm">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleUserAction('delete', user.id)}
                                className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors text-gray-400 hover:text-red-400"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* User Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeUserModal} />
              
              <div className="relative glass-dark p-8 rounded-2xl border border-sneakhead-light-gray max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {modalType === 'view' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white font-grotesk">User Details</h3>
                      <button
                        onClick={closeUserModal}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    
                    {/* User Info */}
                    <div className="space-y-6">
                      {/* Avatar and Basic Info */}
                      <div className="flex items-center space-x-6">
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-xl font-bold text-white">{selectedUser.name}</h4>
                          <p className="text-gray-400">{selectedUser.email}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getRoleConfig(selectedUser.role).color}`}>
                              {getRoleConfig(selectedUser.role).text}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getStatusConfig(selectedUser.status).color}`}>
                              {getStatusConfig(selectedUser.status).text}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h5 className="text-white font-semibold">Contact Information</h5>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">{selectedUser.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">{selectedUser.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">{selectedUser.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h5 className="text-white font-semibold">Account Details</h5>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">Joined: {new Date(selectedUser.joinDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <ShoppingBag className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">Orders: {selectedUser.totalOrders}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">Total Spent: ${(selectedUser.totalSpent || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Addresses */}
                      {selectedUser.addresses.length > 0 && (
                        <div>
                          <h5 className="text-white font-semibold mb-3">Addresses</h5>
                          <div className="space-y-3">
                            {selectedUser.addresses.map((address, index) => (
                              <div key={index} className="p-4 bg-sneakhead-gray rounded-lg">
                                <p className="text-white font-medium capitalize">{address.type} Address</p>
                                <p className="text-gray-400">
                                  {address.street}, {address.city}, {address.state} {address.zip}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {modalType === 'delete' && (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Trash2 className="w-8 h-8 text-red-400" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">Delete User</h3>
                    <p className="text-gray-400 mb-6">
                      Are you sure you want to delete user "{selectedUser.name}"? This action cannot be undone.
                    </p>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={closeUserModal}
                        className="flex-1 px-6 py-3 border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          handleUserAction('delete', selectedUser.id);
                          closeUserModal();
                        }}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                      >
                        Delete User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && !error && (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No users found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.' 
                : 'No users have been registered yet.'
              }
            </p>
          </div>
        )}
      </div>
  );
};

export default UserManagement;
