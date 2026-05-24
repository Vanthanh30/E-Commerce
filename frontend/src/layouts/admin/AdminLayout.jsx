import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../../components/AdminSidebar";
import { useAuth } from "../../context/AuthContext";

export const AdminLayout = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb" style={{ margin: 0 }}>
            THE ATELIER › ADMIN
          </div>
          <form
            className="search-form"
            style={{ flex: 1, maxWidth: "400px", margin: "0 24px" }}
          >
            <input type="text" placeholder="Tìm kiếm..." />
            <button type="submit">
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
          <div className="admin-user">
            <div>
              <div style={{ fontWeight: 600 }}>
                {user?.fullName || "Admin Atelier"}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                SUPER ADMINISTRATOR
              </div>
            </div>
            <div className="admin-user-avatar">
              {user?.fullName?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>

        <footer
          className="site-footer"
          style={{ marginTop: 0, padding: "20px 32px" }}
        >
          <div>© {currentYear} ATELIER ACCORD ADMIN SUITE</div>
          <div>PHIÊN BẢN HỆ THỐNG 2.1.4 - REACT VITE</div>
        </footer>
      </div>
    </div>
  );
};