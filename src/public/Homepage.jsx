import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/Logo.png';
import homepageBg from '../images/HomepageBG.png';  // your background image

function Homepage() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen text-white font-orbitron overflow-x-hidden"
      style={{
        backgroundImage: `url(${homepageBg})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <nav className="flex items-center justify-between px-16 py-8 bg-black bg-opacity-60">
        <img src={logo} alt="Sneakhead Logo" className="h-16" />
        <ul className="flex gap-10 text-sm font-semibold tracking-wider">
          <li>
            <a
              className="relative after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[2px] after:bg-red-600"
              href="#"
            >
              Home
            </a>
          </li>
          <li><a href="#">Man</a></li>
          <li><a href="#">Woman</a></li>
          <li><a href="#">Kids</a></li>
          <li><a href="#">Sale</a></li>
        </ul>
        <div className="flex gap-5 text-lg">
          <i className="fas fa-search"></i>
          <i className="fas fa-shopping-cart"></i>
          <i className="fas fa-user-circle"></i>
        </div>
      </nav>

      <div className="flex justify-between items-center px-16 h-[calc(100vh-120px)] bg-black bg-opacity-50">
        <div className="max-w-[50%]">
          <h1 className="text-[110px] uppercase leading-none">
            <span className="text-red-600 font-bold">Jump</span>
            <span className="font-semibold text-white">man</span>
          </h1>
          <p className="mt-3 text-gray-400 tracking-[8px] uppercase text-sm">
            Basketball Shoe
          </p>
          <p className="mt-10 mb-5 flex items-center gap-5 text-xl">
            <span className="text-red-600 font-bold text-2xl">134$</span>
            <strong>JORDAN JUMPMAN 2021 PF</strong>
          </p>
          <div className="flex gap-5 mt-6">
            <button className="bg-white text-black font-bold py-3 px-6 hover:bg-gray-300 transition-all">
              ADD TO CART
            </button>
            <button className="text-white border border-white font-bold py-3 px-6 hover:bg-white hover:text-black transition-all">
              BUY NOW
            </button>
          </div>
          <div className="mt-10 max-w-md">
            <p className="text-sm uppercase text-gray-400 font-semibold mb-2">Inspiration</p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Inspired by the design of the latest Air Jordan game shoe, the Jordan Jumpman 2021 helps up-and-coming players level up their game.
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center max-w-[620px] rotate-[-10deg] drop-shadow-[10px_10px_20px_black]">
          {/* You can keep shoe image here or remove if you want */}
        </div>
      </div>

      <div className="text-center mt-6 bg-black bg-opacity-60 py-4">
        <button
          onClick={() => navigate('/login')}
          className="m-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="m-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Homepage;
