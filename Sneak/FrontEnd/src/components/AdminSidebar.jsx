import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  ShoppingBag, 
  RefreshCw, 
  Users, 
  X,
  Menu,
  LogOut,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/userapi';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const handleLogout = async () => {
    try {
      // Navigate to homepage immediately to prevent route protection alerts
      navigate('/');
      
      // Then perform cleanup
      logout();
      authService.logout();
      
      // Clear any other potential stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Show success message
      setShowLogoutSuccess(true);
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Ensure cleanup happens even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Navigate to homepage
      navigate('/');
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin',
      active: location.pathname === '/admin',
      description: 'Overview and analytics'
    },
    {
      icon: Package,
      label: 'Products',
      path: '/admin/products',
      active: location.pathname === '/admin/products',
      description: 'Manage your products'
    },
    {
      icon: Plus,
      label: 'Add Product',
      path: '/admin/add-product',
      active: location.pathname === '/admin/add-product',
      highlight: true,
      description: 'Create new product'
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      path: '/admin/orders',
      active: location.pathname === '/admin/orders',
      description: 'View and manage orders'
    },
    {
      icon: RefreshCw,
      label: 'Refunds',
      path: '/admin/refunds',
      active: location.pathname === '/admin/refunds',
      description: 'Handle refund requests'
    },
    {
      icon: Users,
      label: 'Users',
      path: '/admin/users',
      active: location.pathname === '/admin/users',
      description: 'Manage user accounts'
    }
  ];

  return (
    <>
      {/* Logout Success Modal */}
      {showLogoutSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-sneakhead-black border border-sneakhead-light-gray rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Logout Successful!</h3>
            <p className="text-gray-400 mb-6">You have been successfully logged out of the admin panel.</p>
            <button
              onClick={() => {
                setShowLogoutSuccess(false);
                navigate('/');
              }}
              className="bg-sneakhead-red hover:bg-sneakhead-red-light text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-screen bg-sneakhead-black border-r border-sneakhead-light-gray z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto lg:h-screen
        w-80 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-sneakhead-light-gray bg-sneakhead-black/95 backdrop-blur-sm">
          <Link to="/admin" className="flex items-center group">
            <div className="w-12 h-12 transform group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/src/images/Logo.png" 
                alt="SneakHead Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="ml-4">
              <span className="text-xl font-black font-grotesk text-white">
                SNEAK<span className="text-sneakhead-red">HEAD</span>
              </span>
              <div className="text-sm text-gray-400 font-medium">Admin Panel</div>
            </div>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 hover:bg-sneakhead-gray rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-400" />
            ) : (
              <Menu className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-start px-6 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${item.active 
                  ? 'bg-gradient-to-r from-sneakhead-red to-sneakhead-red-light text-white shadow-lg shadow-sneakhead-red/20' 
                  : item.highlight
                  ? 'bg-gradient-to-r from-sneakhead-red/10 to-sneakhead-red-light/10 text-sneakhead-red border border-sneakhead-red/20 hover:bg-sneakhead-red hover:text-white'
                  : 'text-gray-400 hover:text-white hover:bg-sneakhead-gray/50 border border-transparent hover:border-sneakhead-light-gray/20'
                }
              `}
            >
              {/* Active indicator */}
              {item.active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
              )}
              
              <item.icon className={`w-6 h-6 mr-4 transition-transform duration-300 flex-shrink-0 ${
                item.active ? 'scale-110' : 'group-hover:scale-110'
              }`} />
              
              <div className="flex-1">
                <span className="font-medium font-grotesk text-base block">{item.label}</span>
                <span className={`text-xs ${item.active ? 'text-red-100' : 'text-gray-500'}`}>
                  {item.description}
                </span>
              </div>
              
              {item.highlight && !item.active && (
                <div className="ml-auto w-3 h-3 bg-sneakhead-red rounded-full animate-pulse flex-shrink-0" />
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-sneakhead-light-gray bg-sneakhead-black/95 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300 group text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-6 h-6 mr-4 transition-transform duration-300 group-hover:rotate-12" />
            <div>
              <span className="font-medium font-grotesk text-base block">Logout</span>
              <span className="text-xs text-gray-500">Sign out of admin panel</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
