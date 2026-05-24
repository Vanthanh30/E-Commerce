import { useState, useEffect } from "react";

// ==================== API HELPERS ====================
const BASE_URL = "/api/donHang/khachHang";

async function apiGetByTab(tab) {
  const res = await fetch(`${BASE_URL}?tab=${tab}`);
  if (!res.ok) throw new Error("Không thể tải đơn hàng");
  return res.json();
}

async function apiGetChiTiet(idDH) {
  const res = await fetch(`${BASE_URL}/${idDH}/chiTiet`);
  if (!res.ok) throw new Error("Không tải được chi tiết");
  return res.json();
}

// ==================== TAB CONFIG ====================
const TABS = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang vận chuyển" },
  { key: "received", label: "Đã nhận" },
  { key: "cancelled", label: "Đã hủy" },
];

// ==================== CHI TIET DON HANG KH ====================
function ChiTietView({ idDH, activeTab, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // const result = await apiGetChiTiet(idDH);
        // setData(result);
        // Dữ liệu mẫu — xóa khi kết nối API thật
        setData({
          idDH,
          tenKhachHang: "Nguyễn Văn A",
          sdt: "0901234567",
          diaChi: "48 Cao Thắng, Hải Châu, Đà Nẵng",
          thoiGian: "12/06/2025 10:30",
          items: [],
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idDH]);

  const tongTien = data?.items?.reduce((s, i) => s + (i.sl ?? 0) * (i.gia ?? 0), 0) ?? 0;

  if (loading) return <div className="text-center py-5 text-muted">Đang tải...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      {/* Tabs (vẫn hiển thị khi xem chi tiết) */}
      <TabBar activeTab={activeTab} onChangeTab={onBack} readOnly />

      <div style={{ maxWidth: 800, margin: "24px auto", background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        {/* Mã đơn */}
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            Mã đơn hàng: <span style={{ color: "#e91e63" }}>{data.idDH}</span>
          </span>
        </div>

        {/* Địa chỉ + thời gian */}
        <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ color: "#666", margin: "0 0 4px", fontSize: 14 }}>Địa chỉ nhận hàng</p>
            <p style={{ fontWeight: 700, margin: "0 0 4px" }}>
              {data.tenKhachHang}
              <span style={{ fontWeight: 400, color: "#666", marginLeft: 10 }}>{data.sdt}</span>
            </p>
            <p style={{ color: "#666", margin: 0, fontSize: 14 }}>{data.diaChi}</p>
          </div>
          <div>
            <span style={{ display: "block", fontWeight: 700, color: "#333" }}>Thời gian đặt</span>
            <span style={{ display: "block", color: "#666", fontSize: 14 }}>{data.thoiGian}</span>
          </div>
        </div>

        {/* Sản phẩm */}
        <h3 style={{ fontSize: 16, fontWeight: 700, borderBottom: "1px solid #ddd", paddingBottom: 8, marginBottom: 12 }}>
          Các sản phẩm
        </h3>

        {data.items.length === 0 ? (
          <div className="text-center text-muted py-3">Không có sản phẩm</div>
        ) : (
          data.items.map((item) => (
            <div key={item.idsp} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <img
                src={item.hinh || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150"}
                alt={item.tensp}
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 4px", fontWeight: 500 }}>{item.tensp}</p>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Số lượng: {item.sl}</p>
              </div>
              <div style={{ fontWeight: 700, color: "#e91e63" }}>
                {(item.gia ?? 0).toLocaleString("vi-VN")} đ
              </div>
            </div>
          ))
        )}

        {/* Tổng tiền */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid #ddd", marginTop: 8 }}>
          <span style={{ fontSize: 16 }}>Tổng tiền hàng</span>
          <span style={{ fontWeight: 700, color: "#e91e63", fontSize: 16 }}>
            {tongTien.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button className="btn btn-outline-secondary" onClick={onBack}>← Quay lại</button>
        </div>
      </div>
    </div>
  );
}

// ==================== TAB BAR ====================
function TabBar({ activeTab, onChangeTab, readOnly = false }) {
  return (
    <div style={{ borderBottom: "1px solid #e0e0e0", background: "#f9f9f9" }}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !readOnly && onChangeTab(tab.key)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #000" : "2px solid transparent",
              background: "transparent",
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? "#000" : "#333",
              cursor: readOnly ? "default" : "pointer",
              fontSize: 14,
              textAlign: "center",
              minWidth: 120,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== ORDER CARD (CLIENT) ====================
function ClientOrderCard({ item, tab, onViewDetail }) {
  const img = item.hinh || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150";
  const tongTien = ((item.sl ?? 0) * (item.gia ?? 0)).toLocaleString("vi-VN");

  const hinhThucTT = item.hinhthuctt === 0 ? "Thanh toán khi nhận hàng" : "Thanh toán online";

  const statusMap = {
    pending: { text: hinhThucTT, bg: "#fff3cd", color: "#856404" },
    confirmed: { text: "Đã xác nhận", bg: "#d4edda", color: "#155724" },
    shipping: { text: "Đang giao", bg: "#cce5ff", color: "#004085" },
    received: { text: "Đã nhận", bg: "#d1ecf1", color: "#0c5460" },
    cancelled: { text: "Đã hủy", bg: "#FFEBEE", color: "#c62828" },
  }[tab] || {};

  const clickable = tab !== "cancelled";

  return (
    <div
      className="card mb-3"
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 18px", cursor: clickable ? "pointer" : "default",
        background: "#fff8f3", border: "1px solid #f0e0d0", flexWrap: "wrap",
      }}
      onClick={clickable ? () => onViewDetail(item.idDH) : undefined}
    >
      <img
        src={img}
        alt={item.tensp}
        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150"; }}
        style={{ width: 64, height: 64, objectFit: "cover", border: "1px solid #ddd", padding: 4, background: "#fff", flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ fontWeight: 500, color: "#333", marginBottom: 4 }}>{item.tensp}</div>
        {tab !== "cancelled" && (
          <div style={{ fontSize: 13, color: "#777" }}>
            Thành tiền: {tongTien} VNĐ
          </div>
        )}
        {item.ngayBan && <div style={{ fontSize: 13, color: "#999" }}>{item.ngayBan}</div>}
      </div>
      <span style={{ padding: "5px 14px", borderRadius: 4, fontSize: 13, fontWeight: 500, background: statusMap.bg, color: statusMap.color }}>
        {statusMap.text}
      </span>
    </div>
  );
}

// ==================== LIST VIEW ====================
function ListView({ onViewDetail }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async (tab) => {
    setLoading(true);
    setError(null);
    try {
      // const data = await apiGetByTab(tab);
      // setItems(data);
      setItems([]); // Xóa dòng này khi kết nối API thật
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  return (
    <div>
      <h1 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, color: "#333", marginBottom: 20 }}>
        Đơn hàng của tôi
      </h1>

      <div style={{ background: "#fff", borderRadius: 5, border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />

        <div style={{ padding: "16px 24px" }}>
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-5 text-muted">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-5 text-muted">Chưa có đơn hàng nào ở trạng thái này.</div>
          ) : (
            items.map((item) => (
              <ClientOrderCard
                key={item.idDH}
                item={item}
                tab={activeTab}
                onViewDetail={onViewDetail}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export function CustomerOrders() {
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const handleViewDetail = (idDH) => {
    setSelectedId(idDH);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedId(null);
  };

  return (
    <div style={{ marginTop: 30 }}>
      {view === "detail" ? (
        <ChiTietView idDH={selectedId} activeTab={activeTab} onBack={handleBack} />
      ) : (
        <ListView onViewDetail={handleViewDetail} />
      )}
    </div>
  );
}