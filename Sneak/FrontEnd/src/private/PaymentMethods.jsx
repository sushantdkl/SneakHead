import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Star,
  Save,
  Shield,
  Lock
} from 'lucide-react';
import UserLayout from '../components/UserLayout';

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'visa',
      cardNumber: '**** **** **** 4567',
      expiryDate: '12/26',
      cardholderName: 'Marcus Johnson',
      isDefault: true,
      brand: 'Visa',
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 2,
      type: 'mastercard',
      cardNumber: '**** **** **** 1234',
      expiryDate: '08/25',
      cardholderName: 'Marcus Johnson',
      isDefault: false,
      brand: 'Mastercard',
      color: 'from-red-600 to-orange-600'
    },
    {
      id: 3,
      type: 'amex',
      cardNumber: '**** ****** *5678',
      expiryDate: '03/27',
      cardholderName: 'Marcus Johnson',
      isDefault: false,
      brand: 'American Express',
      color: 'from-green-600 to-teal-600'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    isDefault: false
  });

  const cardTypes = [
    { value: 'visa', label: 'Visa', pattern: /^4[0-9]{12}(?:[0-9]{3})?$/ },
    { value: 'mastercard', label: 'Mastercard', pattern: /^5[1-5][0-9]{14}$/ },
    { value: 'amex', label: 'American Express', pattern: /^3[47][0-9]{13}$/ },
    { value: 'discover', label: 'Discover', pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/ }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const openAddModal = () => {
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      isDefault: false
    });
    setEditingCard(null);
    setShowAddModal(true);
  };

  const openEditModal = (card) => {
    setFormData({
      cardNumber: card.cardNumber,
      expiryMonth: card.expiryDate.split('/')[0],
      expiryYear: card.expiryDate.split('/')[1],
      cvv: '',
      cardholderName: card.cardholderName,
      isDefault: card.isDefault
    });
    setEditingCard(card.id);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCard(null);
    setFormData({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      isDefault: false
    });
  };

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    for (const type of cardTypes) {
      if (type.pattern.test(cleanNumber)) {
        return type.value;
      }
    }
    return 'unknown';
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const handleSaveCard = () => {
    const cardType = detectCardType(formData.cardNumber);
    const maskedNumber = formData.cardNumber.replace(/\d(?=\d{4})/g, '*');
    
    const cardData = {
      type: cardType,
      cardNumber: maskedNumber,
      expiryDate: `${formData.expiryMonth}/${formData.expiryYear}`,
      cardholderName: formData.cardholderName,
      isDefault: formData.isDefault,
      brand: cardTypes.find(t => t.value === cardType)?.label || 'Unknown',
      color: getCardColor(cardType)
    };

    if (editingCard) {
      // Update existing card
      setPaymentMethods(prev => prev.map(card => 
        card.id === editingCard ? { ...cardData, id: editingCard } : card
      ));
    } else {
      // Add new card
      const newCard = {
        ...cardData,
        id: Date.now()
      };
      setPaymentMethods(prev => [...prev, newCard]);
    }

    // If this card is set as default, remove default from others
    if (formData.isDefault) {
      setPaymentMethods(prev => prev.map(card => ({
        ...card,
        isDefault: card.id === (editingCard || Date.now())
      })));
    }

    closeModal();
  };

  const handleDeleteCard = (cardId) => {
    setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
  };

  const handleSetDefault = (cardId) => {
    setPaymentMethods(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
  };

  const getCardColor = (type) => {
    const colors = {
      visa: 'from-blue-600 to-blue-800',
      mastercard: 'from-red-600 to-orange-600',
      amex: 'from-green-600 to-teal-600',
      discover: 'from-purple-600 to-indigo-600'
    };
    return colors[type] || 'from-gray-600 to-gray-800';
  };

  const getCardIcon = (type) => {
    // In a real app, you'd use actual card brand icons
    return <CreditCard className="w-8 h-8 text-white" />;
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  return (
    <UserLayout title="Payment Methods" subtitle="Manage your saved payment cards">
      <div className="space-y-6">
        {/* Add Card Button */}
        <div className="flex justify-between items-center">
          <p className="text-gray-400">
            {paymentMethods.length} saved card{paymentMethods.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={openAddModal}
            className="flex items-center px-6 py-3 bg-sneakhead-red hover:bg-red-600 text-white rounded-xl transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </button>
        </div>

        {/* Payment Methods List */}
        {paymentMethods.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paymentMethods.map((card) => (
              <div 
                key={card.id} 
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                  card.isDefault 
                    ? 'ring-2 ring-sneakhead-red shadow-lg animate-pulse-glow' 
                    : ''
                }`}
              >
                {/* Credit Card Design */}
                <div className={`bg-gradient-to-br ${card.color} p-6 text-white relative`}>
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white/20 rounded-full" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 border-2 border-white/20 rounded-full" />
                  </div>
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center space-x-3">
                      {getCardIcon(card.type)}
                      <span className="text-sm font-medium opacity-90">{card.brand}</span>
                    </div>
                    {card.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Default
                      </span>
                    )}
                  </div>
                  
                  {/* Card Number */}
                  <div className="mb-6 relative z-10">
                    <p className="text-2xl font-mono tracking-widest">{card.cardNumber}</p>
                  </div>
                  
                  {/* Card Footer */}
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-xs opacity-70 mb-1">CARDHOLDER NAME</p>
                      <p className="font-medium uppercase tracking-wide">{card.cardholderName}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70 mb-1">EXPIRES</p>
                      <p className="font-mono">{card.expiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="glass-dark border-x border-b border-sneakhead-light-gray p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(card)}
                        className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors group"
                        title="Edit Card"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2 hover:bg-sneakhead-gray rounded-lg transition-colors group"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                    
                    {!card.isDefault && (
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        className="flex items-center px-3 py-1 text-sm border border-sneakhead-light-gray text-gray-400 hover:text-white hover:border-gray-400 rounded-lg transition-colors"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-dark rounded-2xl border border-sneakhead-light-gray p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No payment methods</h3>
            <p className="text-gray-400 mb-6">
              Add your first payment method to make checkout faster and more secure.
            </p>
            <button
              onClick={openAddModal}
              className="btn-glow px-8 py-3"
            >
              Add Your First Card
            </button>
          </div>
        )}

        {/* Add/Edit Card Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
              
              <div className="relative glass-dark p-8 rounded-2xl border border-sneakhead-light-gray max-w-md w-full">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white font-grotesk">
                    {editingCard ? 'Edit Payment Method' : 'Add Payment Method'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Security Notice */}
                <div className="flex items-center space-x-3 p-4 bg-sneakhead-gray rounded-xl mb-6">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Secure & Encrypted</p>
                    <p className="text-gray-400 text-xs">Your payment information is protected with bank-level security</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 pr-12 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 font-mono transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getCardIcon(detectCardType(formData.cardNumber))}
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Expiry Month
                      </label>
                      <select
                        value={formData.expiryMonth}
                        onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                        className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white appearance-none cursor-pointer transition-colors"
                      >
                        <option value="" className="bg-sneakhead-gray">Month</option>
                        {months.map(month => (
                          <option key={month.value} value={month.value} className="bg-sneakhead-gray">
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Expiry Year
                      </label>
                      <select
                        value={formData.expiryYear}
                        onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                        className="w-full px-4 py-3 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white appearance-none cursor-pointer transition-colors"
                      >
                        <option value="" className="bg-sneakhead-gray">Year</option>
                        {years.map(year => (
                          <option key={year} value={year.toString().slice(-2)} className="bg-sneakhead-gray">
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      CVV
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 pr-12 bg-sneakhead-gray border border-sneakhead-light-gray rounded-xl focus:border-sneakhead-red outline-none text-white placeholder-gray-400 font-mono transition-colors"
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="Name as it appears on card"
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
                    <span className="text-white font-medium">Set as default payment method</span>
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
                    onClick={handleSaveCard}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-sneakhead-red hover:bg-red-600 text-white rounded-xl transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCard ? 'Update Card' : 'Save Card'}
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

export default PaymentMethods;
