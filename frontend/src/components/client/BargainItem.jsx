import React from "react";
import { Link } from "react-router-dom";
import { assetUrl, currency, dateTime } from "../../utils/formatters";

const BargainItem = ({ item, action }) => {
  const sessionStatus = item.sessionStatus || item.status;

  const getStatusBadge = (status) => {
    if (status === "accepted") return "badge-success";
    if (status === "countered") return "badge-info";
    if (status === "negotiating" || status === "pending") return "badge-warning";
    return "badge-danger";
  };

  const statusText = (() => {
    const round = item.round || 1;
    if (sessionStatus === "negotiating" && Number(item.round || 0) === 0) return "Đang chờ bắt đầu";
    if (sessionStatus === "negotiating" || sessionStatus === "countered") return `Đang thương lượng vòng ${round}`;
    if (sessionStatus === "accepted") return `Đã chấp nhận vòng ${round}`;
    if (sessionStatus === "rejected") return `Đã từ chối vòng ${round}`;
    if (sessionStatus === "expired") return "Đã hết hạn";
    return item.statusText || "";
  })();

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
                Lượt trả giá:{" "}
                <strong>
                  {Number(item.round || 0) > 0 ? `Vòng ${item.round}/3` : "Chưa bắt đầu"}
                </strong>
              </div>
            </div>
            <span className={`badge ${getStatusBadge(sessionStatus)}`}>
              {statusText}
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
                {item.offerPrice ? currency(item.offerPrice) : "Chưa đề xuất"}
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
              "{item.note}"
            </div>
          )}
        </div>

        <div className="history-footer">
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Cập nhật: {dateTime(item.time)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {action}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BargainItem;
