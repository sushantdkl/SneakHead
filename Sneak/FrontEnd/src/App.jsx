import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './public/Login';
import Signup from './public/Register';  // Assuming Register.jsx exports Signup component
import Homepage from './public/Homepage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
