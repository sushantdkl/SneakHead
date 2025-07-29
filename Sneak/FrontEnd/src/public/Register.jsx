"use client"
import React from "react";
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { userService } from '../services/userapi.js';
import { Eye, EyeOff, CheckCircle, XCircle, PartyPopper } from 'lucide-react';



const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setShowErrorPopup(true);
      return;
    }
    setLoading(true);
    try {
      const userPayload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password
      };
      await userService.createUser(userPayload);
      setShowSuccessPopup(true);
      // Navigate to login after showing success popup
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed');
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <PartyPopper className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Squad! 🎉</h3>
            <p className="text-gray-600 mb-6">Your sneaker journey starts now! Time to lace up and step into greatness.</p>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                navigate("/login");
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Let's Go!
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong 😅</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

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
          <h2 className="text-6xl md:text-7xl font-black text-white leading-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
            Join the
          </h2>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-2 leading-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
            Sneaker
          </h2>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
            Revolution
          </h2>
        </div>

        {/* Primary Quote - Top Right */}
        <div className="absolute right-8 top-16 text-white z-10 text-right">
          <p className="text-xl md:text-2xl font-bold text-white transform rotate-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            "Where legends
          </p>
          <p className="text-xl md:text-2xl font-bold text-white transform rotate-6 -mr-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            are made"
          </p>
        </div>

        {/* Secondary Quote - Bottom Right */}
        <div className="absolute right-8 bottom-32 text-white z-10 text-right">
          <p className="text-xl md:text-2xl font-bold text-white transform -rotate-6" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            "And dreams
          </p>
          <p className="text-xl md:text-2xl font-bold text-white transform -rotate-6 -mr-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(0,0,0,0.6)'}}>
            come to life"
          </p>
        </div>

        {/* Inspirational Quotes - Bottom Left */}
        <div className="absolute bottom-32 left-8 text-white z-10">
          <p className="text-sm text-gray-100 italic mb-2" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'}}>
            "Your journey to greatness starts with one step"
          </p>
          <p className="text-sm text-gray-100 italic" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'}}>
            "Be part of something bigger than just shoes"
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

      {/* Registration Form Section */}
      <div className="w-full max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join SneakHead</h1>
            <p className="text-gray-600 text-sm">Create your account and start your sneaker journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 text-gray-800 bg-white/80 backdrop-blur-sm"
                  placeholder="First name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 text-gray-800 bg-white/80 backdrop-blur-sm"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 text-gray-800 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 text-gray-800 bg-white/80 backdrop-blur-sm"
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all duration-300 text-gray-800 bg-white/80 backdrop-blur-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm animate-pulse">
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
