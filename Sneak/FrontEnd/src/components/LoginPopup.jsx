import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  ShoppingBag, 
  Heart, 
  Zap, 
  X,
  ArrowRight,
  User,
  Sparkles
} from 'lucide-react';

const LoginPopup = ({ isOpen, onClose, type = 'checkout' }) => {
  if (!isOpen) return null;

  const messages = {
    checkout: {
      title: "🚫 Oops! You're Not Logged In",
      subtitle: "Looks like you're trying to checkout without an account!",
      message: "Even the fastest sneakers need a driver's license! 🏃‍♂️💨",
      funQuote: "No account? No problem! Just a quick login away from those fresh kicks! 👟✨",
      buttonText: "Login & Continue Shopping",
      icon: ShoppingBag
    },
    profile: {
      title: "🔒 Profile Access Denied",
      subtitle: "Your profile is playing hide and seek!",
      message: "Can't show you your profile if we don't know who you are! 🕵️‍♂️",
      funQuote: "Time to come out of the shadows and join the SNEAKHEAD family! 👥💫",
      buttonText: "Login to View Profile",
      icon: User
    },
    wishlist: {
      title: "💔 Wishlist Woes",
      subtitle: "Your wishlist is feeling lonely!",
      message: "Wishes don't come true without a login! Make a wish, then login! 🌟",
      funQuote: "Your dream sneakers are waiting, but they need to know your name! 👟💭",
      buttonText: "Login & Start Wishing",
      icon: Heart
    },
    orders: {
      title: "📦 Order Mystery",
      subtitle: "Your orders are playing hide and seek!",
      message: "Can't track orders we can't see! Login to reveal your order history! 🔍",
      funQuote: "Your sneaker journey awaits, but first... the login quest! 🗺️⚡",
      buttonText: "Login & View Orders",
      icon: Zap
    }
  };

  const currentMessage = messages[type] || messages.checkout;
  const IconComponent = currentMessage.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-sneakhead-red to-sneakhead-red-light rounded-full flex items-center justify-center">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {currentMessage.title}
          </h2>
          
          <p className="text-gray-600 mb-3">
            {currentMessage.subtitle}
          </p>

          <div className="bg-gradient-to-r from-sneakhead-red/10 to-sneakhead-red-light/10 rounded-lg p-4 mb-4">
            <p className="text-sneakhead-red font-semibold text-lg">
              {currentMessage.message}
            </p>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            {currentMessage.funQuote}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              onClick={onClose}
              className="w-full bg-gradient-to-r from-sneakhead-red to-sneakhead-red-light text-white font-bold py-3 px-6 rounded-lg hover:from-sneakhead-red-light hover:to-sneakhead-red transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{currentMessage.buttonText}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className="w-full border-2 border-sneakhead-red text-sneakhead-red font-bold py-3 px-6 rounded-lg hover:bg-sneakhead-red hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <User className="w-5 h-5" />
              <span>Create New Account</span>
            </Link>
          </div>

          {/* Fun Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              💡 Pro tip: Login once, shop forever! 🛒✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup; 