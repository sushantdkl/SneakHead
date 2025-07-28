import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Home, 
  Briefcase, 
  Star,
  Save
} from 'lucide-react';
import UserLayout from '../components/UserLayout';
// import { addressService } from '../services/addressService'; // Uncomment if you have an addressService

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    type: 'home',
    label: '',
    name: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false
  });

  const addressTypes = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Briefcase },
    { value: 'other', label: 'Other', icon: MapPin }
  ];

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        // Uncomment and use when addressService is available
        // const response = await addressService.getAddresses(token);
        // setAddresses(response.data || response);
        setAddresses([]); // Placeholder for now
      } catch (err) {
        setError('Failed to fetch addresses');
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openAddModal = () => {
    setFormData({
      type: 'home',
      label: '',
      name: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const openEditModal = (address) => {
    setFormData(address);
    setEditingAddress(address.id);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      type: 'home',
      label: '',
      name: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: false
    });
  };

  const handleSaveAddress = () => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress ? { ...formData, id: editingAddress } : addr
      ));
    } else {
      // Add new address
      const newAddress = {
        ...formData,
        id: Date.now()
      };
      setAddresses(prev => [...prev, newAddress]);
    }

    // If this address is set as default, remove default from others
    if (formData.isDefault) {
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === (editingAddress || Date.now())
      })));
    }

    closeModal();
  };

  const handleDeleteAddress = (addressId) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };

  const handleSetDefault = (addressId) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const getAddressIcon = (type) => {
    const typeConfig = addressTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : MapPin;
  };

  return (
    <UserLayout title="Saved Addresses" subtitle="Manage your shipping addresses">
      <div className="space-y-6">
        {/* Add Address Button */}
        <div className="flex justify-between items-center">
          <p className="text-gray-400">
            {loading ? 'Loading addresses...' : addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center px-6 py-3 bg-sneakhead-red hover:bg-red-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Address
          </button>
        </div>

        {/* Addresses List */}
        {loading ? (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <p className="text-gray-400">Loading addresses...</p>
          </div>
        ) : error ? (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {addresses.map((address) => {
              const IconComponent = getAddressIcon(address.type);
              
              return (
                <div 
                  key={address.id} 
                  className={`glass-dark border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] ${
                    address.isDefault 
                      ? 'border-sneakhead-red shadow-lg animate-pulse-glow' 
                      : 'border-sneakhead-light-gray hover:border-sneakhead-red/30'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${
                        address.isDefault ? 'bg-sneakhead-red/20' : 'bg-sneakhead-gray'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          address.isDefault ? 'text-sneakhead-red' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold font-grotesk">{address.label}</h3>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2 py-1 bg-sneakhead-red/20 text-sneakhead-red text-xs font-medium rounded-full mt-1">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(address)}
                        className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors group"
                        title="Edit Address"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors group"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-2 mb-4">
                    <p className="text-white font-medium">{address.name}</p>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>{address.street}</p>
                      {address.apartment && <p>{address.apartment}</p>}
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                      <p>{address.phone}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="w-full flex items-center justify-center px-4 py-2 border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Set as Default
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No saved addresses</h3>
            <p className="text-gray-400 mb-6">
              Add your first shipping address to make checkout faster.
            </p>
            <button
              onClick={openAddModal}
              className="btn-glow px-8 py-3"
            >
              Add Your First Address
            </button>
          </div>
        )}

        {/* Add/Edit Address Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
              
              <div className="relative glass-dark p-8 rounded-2xl border border-sneakhead-light-gray max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white font-grotesk">
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  {/* Address Type & Label */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Address Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {addressTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => handleInputChange('type', type.value)}
                              className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${
                                formData.type === type.value
                                  ? 'border-sneakhead-red bg-sneakhead-red/10 text-sneakhead-red'
                                  : 'border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400'
                              }`}
                            >
                              <IconComponent className="w-5 h-5 mb-1" />
                              <span className="text-xs">{type.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Label
                      </label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => handleInputChange('label', e.target.value)}
                        placeholder="e.g., Home, Work, Mom's House"
                        className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Recipient's full name"
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                    />
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      placeholder="Street address"
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                    />
                  </div>

                  {/* Apartment/Suite */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Apartment, Suite, etc. (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                      placeholder="Apt, Suite, Floor, etc."
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                    />
                  </div>

                  {/* City, State, Zip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="ZIP Code"
                        className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Country
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 bg-sneakhead-black border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white appearance-none cursor-pointer transition-colors"
                    >
                      <option value="United States" className="bg-sneakhead-black">United States</option>
                      <option value="Canada" className="bg-sneakhead-black">Canada</option>
                      <option value="United Kingdom" className="bg-sneakhead-black">United Kingdom</option>
                      <option value="Australia" className="bg-sneakhead-black">Australia</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone number"
                      className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 transition-colors"
                    />
                  </div>

                  {/* Set as Default */}
                  <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sneakhead-red"></div>
                    </label>
                    <span className="text-white font-medium">Set as default address</span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-sneakhead-red hover:bg-red-600 text-white rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default SavedAddresses;
