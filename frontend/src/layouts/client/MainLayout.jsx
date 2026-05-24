import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Search, User, ShoppingBag } from "lucide-react"; // Thay thế Material Icons cũ

export const MainLayout = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <header className="site-header">
        <Link to="/" className="site-logo">
          The Editorial Atelier
        </Link>

        <nav className="site-nav">
          <Link to="/">Cửa hàng</Link>
          <Link to="/negotiation-history">Thương lượng</Link>
          <Link to="/cart">Giỏ hàng</Link>
          <Link to="/orders">Đơn hàng</Link>
          <Link to="/contact">Liên hệ</Link>
        </nav>

        <div className="header-actions">
          <form className="search-form">
            <input type="text" name="search" placeholder="Tìm kiếm..." />
            <button type="submit" aria-label="Tìm kiếm">
              <Search size={18} />
            </button>
          </form>
          <Link to="/profile" className="action-icon" title="Tài khoản">
            <User />
          </Link>
          <Link to="/cart" className="action-icon" title="Giỏ hàng">
            <ShoppingBag />
          </Link>
        </div>
      </header>

      <main>
        {/* Nội dung của Home, ProductDetail,... sẽ được render tại đây */}
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>© {currentYear} THE EDITORIAL ATELIER. ALL RIGHTS RESERVED.</div>
        <div className="footer-links">
          <Link to="#">Privacy</Link>
          <Link to="#">Terms</Link>
          <Link to="#">Shipping</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </>
  );
};
