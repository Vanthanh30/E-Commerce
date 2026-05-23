// src/App.jsx hoàn chỉnh
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts
import { MainLayout } from "./layouts/client/MainLayout";
import { AdminLayout } from "./layouts/admin/AdminLayout";

// Client Pages
import { Home } from "./pages/client/Home";
import { Cart } from "./pages/client/Cart";
import { Login } from "./pages/client/Login";
import { Register } from "./pages/client/Register";
import { ProductDetail } from "./pages/client/ProductDetail";
import { Profile } from "./pages/client/Profile";
// import { NegotiateAction } from './pages/client/NegotiateAction';
import { NegotiationHistory } from "./pages/client/NegotiationHistory";
import { CustomerOrders } from "./pages/client/CustomerOrders";
import { Checkout } from "./pages/client/Checkout";

// Admin Pages
import { AdminProductList } from "./pages/admin/AdminProductList";
import { RevenueStats } from "./pages/admin/RevenueStats";

function App() {
  const { role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Tuyến đường không cần layout riêng */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Tuyến đường cho khách hàng (Bọc trong MainLayout công khai) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="profile" element={<Profile />} />
          {/* <Route path="negotiate/:id" element={<NegotiateAction />} /> */}
          <Route path="negotiation-history" element={<NegotiationHistory />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>

        {/* Tuyến đường bảo mật của khu vực Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route
            path="products"
            element={
              role === "admin" ? <AdminProductList /> : <Navigate to="/login" />
            }
          />
          <Route
            path="stats"
            element={
              role === "admin" ? <RevenueStats /> : <Navigate to="/login" />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
