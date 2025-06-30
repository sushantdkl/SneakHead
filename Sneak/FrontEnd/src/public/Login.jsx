import React from 'react';
import { Link } from 'react-router-dom';
import background from '../images/SneakheadBackground.jpg'; // update if needed

function Login() {
  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="flex flex-col md:flex-row bg-black bg-opacity-30 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full">
        
        {/* Left Side: Login Form Frame */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-white bg-opacity-20 text-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center mb-8">Sign In</h2>
          <form className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2 rounded-md text-black bg-white bg-opacity-90 placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2 rounded-md text-black bg-white bg-opacity-90 placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right text-sm">
              <a href="#" className="text-blue-300 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-[#6c3d47] hover:bg-[#552c37] text-white font-bold py-2 rounded-md"
            >
              Sign In
            </button>

            {/* Signup Link */}
            <div className="text-center text-sm">
              <Link to="/signup" className="text-blue-300 hover:underline">
                Don’t have an account?
              </Link>
            </div>
          </form>
        </div>

        {/* Right Side: Quote Area */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 px-8 text-white text-center bg-black bg-opacity-10 backdrop-blur-md">
          <p className="text-xl font-bold mb-3">
            "Lace up. The drip starts here."
          </p>
          <p className="text-sm font-light leading-relaxed">
            Where sneakerheads feel at home<br />
            and soles find their soulmate.
          </p>
          <p className="text-sm mt-2 italic text-gray-300">— SneakHead</p>
        </div>
      </div>
    </div>
  );
}


export default Login;
