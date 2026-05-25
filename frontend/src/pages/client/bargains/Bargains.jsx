import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../../../hooks/useOrders";
import OrderItem from "../../../components/client/OrderItem"; // Import Component vừa tạo
import "../../../assets/history-list.css";

const Orders = () => {
  const navigate = useNavigate();
  const { orders, loading, error } = useOrders();

  useEffect(() => {
    if (!sessionStorage.getItem("user")) navigate("/login");
  }, [navigate]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Đang tải lịch sử đơn hàng...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
          color: "var(--danger)",
        }}
      >
        {error}
      </div>
    );

  return (
    <div className="history-container page-container">
      <h1 className="page-title" style={{ marginBottom: "32px" }}>
        Đơn hàng của bạn
      </h1>
      {orders.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
          Bạn chưa có đơn hàng nào.
        </p>
      ) : (
        orders.map((item, index) => (
          <OrderItem key={`${item.orderId}-${index}`} item={item} />
        ))
      )}
    </div>
  );
};

export default Orders;
