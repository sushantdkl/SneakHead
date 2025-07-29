import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sneakhead-black border-t border-sneakhead-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/src/images/Logo.png"
                alt="SNEAKHEAD Logo"
                className="w-8 h-8"
              />
              <span className="text-xl font-black font-grotesk text-white tracking-tight">
                SNEAK<span className="text-sneakhead-red">HEAD</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs">
              Discover the latest in sneaker fashion and streetwear culture.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/men" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link to="/women" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link to="/kids" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Kids
                </Link>
              </li>
              <li>
                <Link to="/sale" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/_sushant_dhakal/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-sneakhead-light-gray">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} SNEAKHEAD. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
