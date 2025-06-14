import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import background from '../images/SneakheadBackground.jpg'; // Change to your actual background image path

function Signup() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Your registration logic here
    // On success:
    navigate('/');
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center bg-no-repeat bg-center bg-cover text-white px-4"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center md:items-start gap-10 py-16 px-4">
        {/* Left Side: Signup Box Frame */}
        <div className="w-full md:w-7/12 flex justify-center">
          <div className="bg-white bg-opacity-25 backdrop-blur-md rounded-xl shadow-lg p-10 w-full max-w-md text-black">
            <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block font-semibold mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  required
                  className="w-full p-3 rounded-md text-sm bg-white text-black placeholder-gray-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full p-3 rounded-md text-sm bg-white text-black placeholder-gray-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  className="w-full p-3 rounded-md text-sm bg-white text-black placeholder-gray-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#6c3d47] hover:bg-[#552c37] text-white font-semibold py-3 rounded-md"
              >
                Register
              </button>

              <div className="text-center text-sm mt-4">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Already have an account?
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Optional info or image */}
        <div className="w-full md:w-5/12 flex flex-col items-center md:items-end text-center md:text-right px-4 md:px-0">
          {/* You can add your logo or any content here */}
        </div>
      </div>
    </div>
  );
}

export default Signup;
