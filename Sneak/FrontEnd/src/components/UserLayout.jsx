import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/userapi';

const UserLayout = ({ children, title, subtitle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to logout?');
    
    if (isConfirmed) {
      // Use the authService logout function for complete cleanup
      authService.logout();
      
      // Use the AuthContext logout function to update state
      logout();
      
      // Redirect to homepage
      navigate('/');
    }
  };

  const menuItems = [
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      description: 'Personal information and settings'
    },
    {
      name: 'My Orders',
      path: '/my-orders',
      icon: Package,
      description: 'Track your orders and history'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full flex items-center justify-between p-4 glass-dark border border-sneakhead-light-gray rounded-xl text-white"
              >
                <span className="font-semibold">Dashboard Menu</span>
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Sidebar */}
            <div className={`lg:w-80 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="glass-dark border border-sneakhead-light-gray rounded-2xl p-6 sticky top-28">
                {/* User Info */}
                <div className="mb-8 pb-6 border-b border-sneakhead-light-gray">
                  <div>
                    <h3 className="text-white font-bold font-grotesk">{user?.name || 'User'}</h3>
                    <p className="text-gray-400 text-sm">{user?.email || 'user@email.com'}</p>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.path);
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                          isActive
                            ? 'bg-sneakhead-red text-white shadow-lg animate-pulse-glow'
                            : 'hover:bg-sneakhead-gray text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                          <div>
                            <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                              {item.name}
                            </span>
                            <p className={`text-xs ${isActive ? 'text-red-100' : 'text-gray-500'}`}>
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-white' : 'text-gray-500 group-hover:text-white group-hover:translate-x-1'
                        }`} />
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout Button */}
                <div className="mt-8 pt-6 border-t border-sneakhead-light-gray">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-4 text-gray-400 hover:text-red-400 hover:bg-sneakhead-gray rounded-xl transition-all duration-300 group"
                  >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white font-grotesk mb-2">{title}</h1>
                {subtitle && <p className="text-gray-400">{subtitle}</p>}
              </div>

              {/* Content */}
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
