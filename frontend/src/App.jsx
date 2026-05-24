import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import { MainLayout } from "./layouts/client/MainLayout";
import { AdminLayout } from "./layouts/admin/AdminLayout";

// Auth
import { Login } from "./pages/client/auth/Login";
import { Register } from "./pages/client/auth/Register";

// Client Pages
import { Home } from "./pages/client/home/Home";
import { ProductDetail } from "./pages/client/product/ProductDetail";
import { Cart } from "./pages/client/cart/Cart";
import { Checkout } from "./pages/client/payment/Checkout";
import { OnlPayment } from "./pages/client/payment/OnlPayment";
import { CustomerOrders } from "./pages/client/orders/CustomerOrders";
import { NegotiationHistory } from "./pages/client/negotiation/NegotiationHistory";
import { Profile } from "./pages/client/auth/Profile";
import { Contact } from "./pages/client/layout_default/Contact";

// Admin Pages
import { AdminProductList } from "./pages/admin/products/AdminProductList";
import { RevenueStats } from "./pages/admin/stats/RevenueStats";
import { BiddingDetails } from "./pages/admin/bidding/BiddingDetails";
import { Category } from "./pages/admin/category/Category";
import { AdminOrders } from "./pages/admin/orders/AdminOrders";

function App() {
  const { role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth — không cần layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Client — bọc trong MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment-online" element={<OnlPayment />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="negotiation-history" element={<NegotiationHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Admin — bọc trong AdminLayout, yêu cầu role admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="products" element={role === "admin" ? <AdminProductList /> : <Navigate to="/login" />} />
          <Route path="stats" element={role === "admin" ? <RevenueStats /> : <Navigate to="/login" />} />
          <Route path="biddingdetails" element={role === "admin" ? <BiddingDetails /> : <Navigate to="/login" />} />
          <Route path="category" element={role === "admin" ? <Category /> : <Navigate to="/login" />} />
          <Route path="orders" element={role === "admin" ? <AdminOrders /> : <Navigate to="/login" />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;