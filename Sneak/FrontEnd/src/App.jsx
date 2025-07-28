// Main App component
import React from "react";
import { useLocation } from "react-router-dom";

import Navigation from "./components/Navigation";

import Footer from "./components/FooterNew";
import ScrollToTop from "./components/ScrollTop";

import UserRoutes from "./routes/UserRoutes";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideFooterRoutes = ["/login", "/signup", "/security-setup"];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname) || isAdminRoute;

  const renderNavbar = () => {
    // Don't render any navbar for admin routes since they have their own sidebar
    if (isAdminRoute) return null;
    if (isLoggedIn && user?.isAdmin) return null; // Admin users outside admin routes get no navbar
    return <Navigation />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {renderNavbar()}

      <main className="flex-grow">
        <ScrollToTop />
        <UserRoutes />
      </main>

      {!shouldHideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
