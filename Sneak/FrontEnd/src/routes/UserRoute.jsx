import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginPopup from "../components/LoginPopup";

const UserRoute = ({ children }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('checkout');
  const location = useLocation();
  
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!token || !user) {
      // Determine popup type based on current route
      const path = location.pathname;
      if (path.includes('checkout')) {
        setPopupType('checkout');
      } else if (path.includes('profile')) {
        setPopupType('profile');
      } else if (path.includes('wishlist')) {
        setPopupType('wishlist');
      } else if (path.includes('orders')) {
        setPopupType('orders');
      } else {
        setPopupType('checkout');
      }
      setShowPopup(true);
    }
  }, [token, user, location.pathname]);

  if (!token || !user) {
    return (
      <>
        <LoginPopup 
          isOpen={showPopup} 
          onClose={() => setShowPopup(false)} 
          type={popupType}
        />
        <Navigate to="/" replace />
      </>
    );
  }

  if (user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default UserRoute;
