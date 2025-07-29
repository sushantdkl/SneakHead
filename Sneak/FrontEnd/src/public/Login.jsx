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
      <div className="flex-1 relative overflow-hidden">
        {/* Background Image */}
        <img 
          src="/SneakheadBackground.jpg"
          alt="SneakHead Background"
          className="absolute inset-0 w-full h-full object-cover"
        />



        {/* Main Heading - Center Left */}
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 text-white z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
            Lace up.
          </h2>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-2 leading-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
            The drip starts here.
          </h2>
        </div>

        {/* Primary Quote - Top Right */}
        <div className="absolute right-8 top-16 text-white z-10 text-right">
          <p className="text-xl md:text-2xl font-bold text-white transform rotate-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            "Where every step
          </p>
          <p className="text-xl md:text-2xl font-bold text-white transform rotate-6 -mr-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            tells a story"
          </p>
        </div>

        {/* Secondary Quote - Bottom Right */}
        <div className="absolute right-8 bottom-32 text-white z-10 text-right">
          <p className="text-xl md:text-2xl font-bold text-white transform -rotate-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            "And every sneaker
          </p>
          <p className="text-xl md:text-2xl font-bold text-white transform -rotate-6 -mr-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            has a soul"
          </p>
        </div>

        {/* Inspirational Quotes - Bottom Left */}
        <div className="absolute bottom-32 left-8 text-white z-10">
          <p className="text-sm text-gray-100 italic mb-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'}}>
            "Life is short, make every step count"
          </p>
          <p className="text-sm text-gray-100 italic" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'}}>
            "Sneakers are not just shoes, they're dreams on feet"
          </p>
        </div>

        {/* Signature - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white z-10">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-lg text-white font-bold" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>-SneakHead</p>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Sign in to your SneakHead account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 text-gray-800 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
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
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 text-gray-800 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm animate-pulse">
                {error}
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-red-600 transition-colors font-medium">
                Forgot Password?
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-red-600 hover:text-red-700 font-bold transition-colors">
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
