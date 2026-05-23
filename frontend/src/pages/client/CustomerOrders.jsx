import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { orderService } from "../../services/order.service";
import { currency, dateTime } from "../../utils/formatters";

export const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(1); // Mặc định: 1 = Chờ xác nhận

  useEffect(() => {
    if (user?.customerId) {
      orderService
        .getListByCustomer(user.customerId)
        .then((data) => setOrders(data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  // Lọc đơn hàng theo tab đang chọn
  const filteredOrders = orders.filter((order) => order.status === activeTab);

  const tabs = [
    { id: 1, label: "Chờ xác nhận" },
    { id: 2, label: "Đã xác nhận" },
    { id: 3, label: "Đang vận chuyển" },
    { id: 4, label: "Đã nhận" },
    { id: 5, label: "Đã hủy" },
  ];

  return (
    <div className="page-container orders-page">
      <h1 className="page-title">Đơn hàng của tôi</h1>

      {/* Component Tabs tích hợp */}
      <div className="order-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`order-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ cursor: "pointer" }}
          >
            <a as="button">{tab.label}</a>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">Không có đơn hàng ở trạng thái này.</div>
      ) : (
        filteredOrders.map((item) => (
          <div key={item.orderId} className="order-card">
            <img
              src={
                item.imageUrl ||
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150"
              }
              alt={item.productName}
            />
            <div className="order-card-body">
              <div className="order-card-title">{item.productName}</div>
              <div className="order-card-meta">
                Thành tiền: {currency(item.price * item.quantity)}
              </div>
              <div className="order-card-meta">{dateTime(item.saleDate)}</div>
            </div>
            <span
              className="status-badge"
              style={
                item.status === 5
                  ? { background: "#FFEBEE", color: "var(--danger)" }
                  : {}
              }
            >
              {item.statusText}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
