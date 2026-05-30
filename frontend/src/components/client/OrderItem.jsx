import React, { useState } from "react";
import { assetUrl, currency, dateTime } from "../../utils/formatters";
// Lưu ý: Đường dẫn import utils có thể khác tùy thuộc vào thư mục của bạn (ví dụ: '../utils/formatters')

const OrderItem = ({ item, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const getStatusBadge = (status) => {
    if (status === 1) return "badge-warning";
    if (status === 2 || status === 3) return "badge-info";
    if (status === 4) return "badge-success";
    return "badge-danger";
  };

  // Tính tổng số lượng sản phẩm vật lý trong đơn
  const totalQuantity = item.items
    ? item.items.reduce((sum, p) => sum + p.quantity, 0)
    : 0;

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setCancelling(true);
    try {
      await onCancel(item.orderId);
    } catch (err) {
      alert(err.message || "Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      className="history-card"
      style={{ flexDirection: "column", gap: "16px" }}
    >
      {/* 1. Phần Header: Thông tin chung của đơn hàng */}
      <div
        className="history-header"
        style={{
          borderBottom: "1px solid var(--border)",
          paddingBottom: "16px",
          marginBottom: "4px",
        }}
      >
        <div>
          <div className="history-meta" style={{ fontSize: "14px" }}>
            Mã đơn:{" "}
            <strong style={{ color: "var(--text)" }}>{item.orderId}</strong>
            <span style={{ margin: "0 12px", color: "var(--border)" }}>|</span>
            {dateTime(item.saleDate)}
          </div>
        </div>
        <span className={`badge ${getStatusBadge(item.status)}`}>
          {item.statusText}
        </span>
      </div>

      {/* 2. Phần Body: Lặp qua TẤT CẢ sản phẩm để hiển thị */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {item.items &&
          item.items.map((prod, index) => (
            <div
              key={index}
              style={{ display: "flex", gap: "16px", alignItems: "center" }}
            >
              <img
                src={assetUrl(prod.imageUrl)}
                alt={prod.productName}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                }}
              />
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: "500",
                    marginBottom: "4px",
                    color: "var(--text)",
                  }}
                >
                  {prod.productName}
                </h4>
                <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  Số lượng: {prod.quantity}
                </div>
              </div>
              <div
                style={{
                  fontWeight: "600",
                  color: "var(--text)",
                  fontSize: "15px",
                }}
              >
                {currency(prod.price)}
              </div>
            </div>
          ))}
      </div>

      {/* 3. Phần Footer: Địa chỉ & Tổng tiền */}
      <div
        className="history-footer"
        style={{
          marginTop: "8px",
          borderTop: "1px solid var(--border)",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <i
            className="material-icons"
            style={{ fontSize: "16px", marginRight: "6px" }}
          >
            location_on
          </i>
          {item.shippingAddress}
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "4px",
            }}
          >
            Tổng cộng ({totalQuantity} sản phẩm):
          </div>
          <strong style={{ fontSize: "18px", color: "var(--primary)" }}>
            {currency(item.totalAmount)}
          </strong>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>
            Mã đơn: <strong>{item.orderId}</strong>
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Trạng thái: <strong>{item.statusText}</strong>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Ẩn chi tiết" : "Xem chi tiết"}
        </button>
        {item.status === 1 && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Đang hủy..." : "Hủy đơn"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderItem;
