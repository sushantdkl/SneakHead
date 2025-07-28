"use client"
import React from "react";

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/userapi';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Call the authService to login
      const response = await authService.login(formData);
      const userData = response.data?.user || response.user;
      
      // Transform user data to include isAdmin property
      const transformedUser = {
        ...userData,
        isAdmin: userData.role === 'admin'
      };
      
      // Call the context login function with user data
      login(transformedUser);
      
      // The PublicRoute component will handle navigation based on user role
      // Admin users will be redirected to /admin
      // Regular users will be redirected to /
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Background Image Section */}
      <div
        className="flex-1 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:'url("src/images/SneakHeadBackground.png")',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>

        {/* Logo */}
        <div className="absolute top-6 right-6 z-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-orange-600 font-bold text-lg">SH</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center text-white z-10 px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Lace up. The drip starts here.</h2>
          <p className="text-lg md:text-xl mb-2">Where Sneakerheads feel at home and</p>
          <p className="text-lg md:text-xl mb-4">soles find their soulmate.</p>
          <p className="text-sm text-gray-300">-SneakHead</p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full max-w-md bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors text-black"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors text-black"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-600 text-center animate-pulse-glow">{error}</div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-red-600 hover:text-red-700 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
