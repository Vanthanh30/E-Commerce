// src/layouts/admin/AdminLayout.jsx

import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AdminSidebar } from "../../components/admin/AdminSidebar";

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const currentYear = new Date().getFullYear();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    localStorage.removeItem("role");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login"); // Adjust this route if needed
  };

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
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          <div className="admin-user" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>
                  {user?.fullName || "Admin Atelier"}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                  }}
                >
                  SUPER ADMINISTRATOR
                </div>
              </div>

              <div className="admin-user-avatar">
                {user?.fullName?.charAt(0) || "A"}
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              style={{ 
                display: "flex", alignItems: "center", gap: "6px", 
                padding: "6px 12px", border: "1px solid var(--border-color, #E5E7EB)",
                background: "white", borderRadius: "6px", cursor: "pointer",
                color: "var(--text-color, #374151)", fontSize: "14px", fontWeight: 500
              }}
            >
              <LogOut size={16} /> Đăng xuất
            </button>
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

export default AdminLayout;