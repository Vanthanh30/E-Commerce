import React from "react";
import { assetUrl, currency, dateTime } from "../utils/formatters";

const OrderItem = ({ item }) => {
  const getStatusBadge = (status) => {
    if (status === 1) return "badge-warning";
    if (status === 2 || status === 3) return "badge-info";
    if (status === 4) return "badge-success";
    return "badge-danger";
  };

  return (
    <div className="history-card">
      <img
        src={assetUrl(item.imageUrl)}
        alt={item.productName}
        className="history-img"
      />
      <div className="history-content">
        <div>
          <div className="history-header">
            <div>
              <h3 className="history-title">{item.productName}</h3>
              <div className="history-meta">
                Mã đơn: <strong>{item.orderId}</strong> | Số lượng:{" "}
                {item.quantity}
              </div>
            </div>
            <span className={`badge ${getStatusBadge(item.status)}`}>
              {item.statusText}
            </span>
          </div>
          <div style={{ fontSize: "14px", marginBottom: "8px" }}>
            <i
              className="material-icons"
              style={{
                fontSize: "16px",
                verticalAlign: "middle",
                marginRight: "4px",
              }}
            >
              location_on
            </i>
            {item.shippingAddress}
          </div>
        </div>

        <div className="history-footer">
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {dateTime(item.saleDate)}
          </span>
          <strong style={{ fontSize: "16px", color: "var(--primary)" }}>
            {currency(item.price * item.quantity)}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
