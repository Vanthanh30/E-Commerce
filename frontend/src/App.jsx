import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/client/MainLayout";
import AdminLayout from "./layouts/admin/AdminLayout";

// Client Pages
import Home from "./pages/client/home/Home";
import Login from "./pages/client/auth/Login";
import Register from "./pages/client/auth/Register";
import Profile from "./pages/client/auth/Profile";
import ProductDetail from "./pages/client/product-detail/ProductDetail";
import Cart from "./pages/client/cart/Cart";
import Checkout from "./pages/client/checkout/Checkout";
import Orders from "./pages/client/orders/Orders";
import Bargains from "./pages/client/bargains/Bargains";

// Admin Pages
import AdminProductList from "./pages/admin/products/AdminProductList";
import RevenueStats from "./pages/admin/dashboard/Dashboard";
import BiddingDetails from "./pages/admin/bidding/BiddingDetails";
import Category from "./pages/admin/category/Category";
import AdminOrders from "./pages/admin/orders/AdminOrders";

function App() {
  const role = sessionStorage.getItem("role");

  return (
    <Routes>

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Client */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="bargains" element={<Bargains />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          role === "admin"
            ? <AdminLayout />
            : <Navigate to="/login" />
        }
      >

        <Route path="products" element={<AdminProductList />} />
        <Route path="stats" element={<RevenueStats />} />
        <Route path="biddingdetails" element={<BiddingDetails />} />
        <Route path="category" element={<Category />} />
        <Route path="orders" element={<AdminOrders />} />

      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={<h2>404 - Không tìm thấy trang</h2>}
      />

    </Routes>
  );
}

export default App;