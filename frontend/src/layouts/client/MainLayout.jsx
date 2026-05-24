import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const MainLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div>
      <header className="site-header">
        <Link to="/" className="site-logo">
          THE ATELIER
        </Link>
        <nav className="site-nav">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Cửa hàng
          </Link>
          <Link
            to="/bargains"
            className={location.pathname.includes("/bargain") ? "active" : ""}
          >
            Thương lượng
          </Link>
          <Link
            to="/cart"
            className={location.pathname === "/cart" ? "active" : ""}
          >
            Giỏ hàng
          </Link>
          <Link
            to="/orders"
            className={location.pathname.includes("/order") ? "active" : ""}
          >
            Đơn hàng
          </Link>
        </nav>

        <div className="header-actions">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Tìm kiếm..." />
            <button type="submit">
              <i className="material-icons" style={{ fontSize: "18px" }}>
                search
              </i>
            </button>
          </form>

          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginLeft: "8px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: "600" }}>
                {user.fullName || user.username}
              </div>
              <Link to="/profile" className="action-icon">
                <i className="material-icons">person</i>
              </Link>
              <button
                onClick={logout}
                className="action-icon"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <i
                  className="material-icons"
                  style={{ color: "var(--danger)" }}
                >
                  logout
                </i>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginLeft: "8px",
              }}
            >
              <Link
                to="/login"
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "var(--text)",
                }}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  padding: "6px 16px",
                  fontSize: "13px",
                  height: "36px",
                }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          © {new Date().getFullYear()} THE EDITORIAL ATELIER. ALL RIGHTS
          RESERVED.
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
