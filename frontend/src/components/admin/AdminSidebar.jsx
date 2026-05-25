import React from "react";
import { NavLink, Link } from "react-router-dom";
import "./AdminSidebar.css";

const IconInventory = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const IconCategory = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

const IconOrders = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const IconHandshake = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l8.42 8.42 8.42-8.42a5.4 5.4 0 0 0 0-7.65z" />
    </svg>
);

const IconChart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
);

const IconStorefront = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const navItems = [
    { to: "/admin/stats", icon: <IconChart />, label: "Thống kê" },
    { to: "/admin/products", icon: <IconInventory />, label: "Sản phẩm" },
    { to: "/admin/category", icon: <IconCategory />, label: "Danh mục" },
    { to: "/admin/orders", icon: <IconOrders />, label: "Đơn hàng" },
    { to: "/admin/biddingdetails", icon: <IconHandshake />, label: "Yêu cầu trả giá" },
];

export const AdminSidebar = () => {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <strong>The Atelier</strong>
                <span>Admin Suite</span>
            </div>
            <ul className="admin-nav">
                {navItems.map(({ to, icon, label }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            {icon}
                            {label}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <div className="admin-sidebar-footer">
                <Link to="/">
                    <IconStorefront />
                    Cửa hàng
                </Link>
            </div>
        </aside>
    );
};