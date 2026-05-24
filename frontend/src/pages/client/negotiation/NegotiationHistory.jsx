// src/pages/client/NegotiationHistory.jsx
import React, { useState, useEffect } from "react";
import { bargainService } from "../../../services/client/bargain.service";
import { currency, dateTime } from "../../../utils/formatters";

export const NegotiationHistory = () => {
  const [history, setHistory] = useState([]);
  const customerId = "0900000001"; // Lấy từ Auth Context

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await bargainService.getListByCustomer(customerId);
        setHistory(data);
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="page-container negotiation-page">
      <h1 className="page-title">Lịch sử trả giá</h1>
      {history.length === 0 ? (
        <div className="empty-state">Chưa có lịch sử thương lượng.</div>
      ) : (
        history.map((item, index) => (
          <div key={index} className="history-item">
            <img src={item.imageUrl} alt={item.productName} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                {item.productName}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                Trạng thái:{" "}
                <strong style={{ color: "var(--primary)" }}>
                  {item.statusText}
                </strong>{" "}
                · Vòng {item.round}
              </div>
              <div style={{ fontSize: "13px", marginTop: "8px" }}>
                Giá đề nghị: <strong>{currency(item.offerPrice)}</strong> · SL:{" "}
                {item.quantity}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                {dateTime(item.time)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
