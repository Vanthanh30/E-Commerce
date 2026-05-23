import React from "react";
import { NavLink, Link } from "react-router-dom";

export const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <strong>The Atelier</strong>
        <span>Admin Suite</span>
      </div>
      <ul className="admin-nav">
        {/* NavLink sẽ tự động thêm class="active" nếu URL trùng khớp */}
        <li>
          <NavLink to="/admin/products">
            <i className="material-icons">inventory_2</i> Sản phẩm
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/categories">
            <i className="material-icons">category</i> Danh mục
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/orders">
            <i className="material-icons">receipt_long</i> Đơn hàng
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/bargains">
            <i className="material-icons">handshake</i> Yêu cầu trả giá
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin/stats">
            <i className="material-icons">bar_chart</i> Thống kê
          </NavLink>
        </li>
      </ul>
      <div className="admin-sidebar-footer">
        <Link to="/">
          <i
            className="material-icons"
            style={{ fontSize: "16px", verticalAlign: "middle" }}
          >
            storefront
          </i>{" "}
          Cửa hàng
        </Link>
      </div>
    </aside>
  );
};
