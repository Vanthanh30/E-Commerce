import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="admin-shell">
      {/* Tương đương _AdminSidebar.cshtml */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>The Atelier</strong>
          <span>Admin Suite</span>
        </div>
        <ul className="admin-nav">
          <li>
            <Link to="/admin/dashboard">Thống kê</Link>
          </li>
          <li>
            <Link to="/admin/products">Sản phẩm</Link>
          </li>
          <li>
            <Link to="/admin/orders">Đơn hàng</Link>
          </li>
        </ul>
      </aside>

      <div className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
