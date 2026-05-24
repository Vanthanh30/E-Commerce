import { Routes, Route } from "react-router-dom";
// Import Layouts
import MainLayout from "./layouts/client/MainLayout";
import AdminLayout from "./layouts/admin/AdminLayout";
// Import Pages
import Home from "./pages/client/home/Home";
import Login from "./pages/client/auth/Login";
import Register from "./pages/client/auth/Register";
import Profile from "./pages/client/auth/Profile";
import ProductDetail from "./pages/client/product-detail/ProductDetail";
import Cart from "./pages/client/cart/Cart";
import Checkout from "./pages/client/checkout/Checkout";
import Orders from "./pages/client/orders/Orders";
import Bargains from "./pages/client/bargains/Bargains";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Các Route dành cho Khách hàng (Dùng chung MainLayout) */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Orders />} />
        <Route path="bargains" element={<Bargains />} />
      </Route>

      {/* Các Route dành cho Admin (Dùng chung AdminLayout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<h2>Dashboard Admin</h2>} />
        {/* Sau này thêm: <Route path="products" element={<Products />} /> */}
      </Route>

      {/* Route cho trang 404 */}
      <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
    </Routes>
  );
}

export default App;
