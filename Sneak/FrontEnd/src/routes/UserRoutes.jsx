
import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";

// Public Pages
import Homepage from "../public/Homepage";
import Login from "../public/Login";
import Register from "../public/Register";
import ProductDescription from "../public/ProductDescription";
import Cart from "../public/Cart";
import Checkout from "../public/Checkout";
import Men from "../public/Men";
import Women from "../public/Women";
import Kids from "../public/Kids";
import Sale from "../public/Sale";
import AllProducts from "../public/AllProducts";


// Private Pages
import UserProfile from "../private/UserProfile";
import MyOrders from "../private/MyOrders";
import PaymentMethods from "../private/PaymentMethods";
import Wishlist from "../private/Wishlist";
import SavedAddresses from "../private/SavedAddresses";

// Admin Pages
import AdminDashboard from "../private/AdminDashboard";
import ProductManagement from "../private/ProductManagement";
import AddEditProduct from "../private/AddEditProduct";
import OrdersManagement from "../private/OrdersManagement";
import RefundRequestPage from "../private/RefundRequestPage";
import UserManagement from "../private/UserManagement";

// Admin Layout
import AdminLayout from "../components/AdminLayout";

export default function UserRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/products" element={<AllProducts />} />
      <Route path="/men" element={<Men />} />
      <Route path="/women" element={<Women />} />
      <Route path="/kids" element={<Kids />} />
      <Route path="/sale" element={<Sale />} />


      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Semi-public product pages */}
      <Route path="/product/:id" element={<ProductDescription />} />
      <Route path="/cart" element={<Cart />} />

      {/* Private User Routes */}
      <Route
        path="/checkout"
        element={
          <UserRoute>
            <Checkout />
          </UserRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <UserRoute>
            <UserProfile />
          </UserRoute>
        }
      />
      <Route
        path="/my-orders"
        element={
          <UserRoute>
            <MyOrders />
          </UserRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <UserRoute>
            <MyOrders />
          </UserRoute>
        }
      />
      <Route
        path="/payment-methods"
        element={
          <UserRoute>
            <PaymentMethods />
          </UserRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <UserRoute>
            <Wishlist />
          </UserRoute>
        }
      />
      <Route
        path="/saved-addresses"
        element={
          <UserRoute>
            <SavedAddresses />
          </UserRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="add-product" element={<AddEditProduct />} />
        <Route path="edit-product/:id" element={<AddEditProduct />} />
        <Route path="orders" element={<OrdersManagement />} />
        <Route path="refunds" element={<RefundRequestPage />} />
        <Route path="users" element={<UserManagement />} />
      </Route>

      {/* Fallback for unknown routes */}
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}
