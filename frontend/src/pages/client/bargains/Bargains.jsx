import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBargains } from "../../../hooks/useBargains";
import BargainItem from "../../../components/client/BargainItem"; // Đổi đường dẫn nếu file nằm ở components/client/BargainItem
import "../../../assets/history-list.css";

const Bargains = () => {
  const navigate = useNavigate();
  const { bargains, loading, error } = useBargains();

  useEffect(() => {
    if (!sessionStorage.getItem("user")) navigate("/login");
  }, [navigate]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Đang tải lịch sử thương lượng...
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
      {/* TIÊU ĐỀ CHUẨN CỦA TRANG NÀY ĐÂY */}
      <h1 className="page-title" style={{ marginBottom: "32px" }}>
        Lịch sử thương lượng giá
      </h1>

      {bargains.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
          Bạn chưa có phiên thương lượng nào.
        </p>
      ) : (
        bargains.map((item, index) => (
          <BargainItem
            key={`${item.bargainId || item._id}-${index}`}
            item={item}
          />
        ))
      )}
    </div>
  );
};

export default Bargains;
