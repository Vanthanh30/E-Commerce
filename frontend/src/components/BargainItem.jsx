import React from "react";
import { Link } from "react-router-dom";
import { assetUrl, currency, dateTime } from "../utils/formatters";

const BargainItem = ({ item }) => {
  const getStatusBadge = (status) => {
    if (status === "pending") return "badge-warning";
    if (status === "countered") return "badge-info";
    if (status === "accepted") return "badge-success";
    return "badge-danger";
  };

  return (
    <div className="history-card">
      <Link to={`/product/${item.productId}`}>
        <img
          src={assetUrl(item.imageUrl)}
          alt={item.productName}
          className="history-img"
          style={{ cursor: "pointer" }}
        />
      </Link>

      <div className="history-content">
        <div>
          <div className="history-header">
            <div>
              <Link
                to={`/product/${item.productId}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <h3 className="history-title">{item.productName}</h3>
              </Link>
              <div className="history-meta">
                Lượt trả giá: <strong>Vòng {item.round}/3</strong>
              </div>
            </div>
            <span className={`badge ${getStatusBadge(item.status)}`}>
              {item.statusText}
            </span>
          </div>

          <div
            style={{
              fontSize: "14px",
              display: "flex",
              gap: "32px",
              marginBottom: "8px",
            }}
          >
            <div>
              Giá niêm yết:
              <br />
              <strong style={{ textDecoration: "line-through", color: "#999" }}>
                {currency(item.listedPrice)}
              </strong>
            </div>
            <div>
              Mức giá bạn đề xuất:
              <br />
              <strong style={{ color: "var(--primary)", fontSize: "16px" }}>
                {currency(item.offerPrice)}
              </strong>
            </div>
          </div>

          {item.note && (
            <div
              style={{
                fontSize: "13px",
                background: "#f9f9f9",
                padding: "8px 12px",
                borderRadius: "4px",
                fontStyle: "italic",
                marginTop: "8px",
              }}
            >
              " {item.note} "
            </div>
          )}
        </div>

        <div className="history-footer">
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Cập nhật: {dateTime(item.time)}
          </span>
          {item.status === "accepted" && (
            <span
              style={{ fontSize: "13px", color: "#16a34a", fontWeight: "500" }}
            >
              Đơn hàng đã được tạo!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BargainItem;
