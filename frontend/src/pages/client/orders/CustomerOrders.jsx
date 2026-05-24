import { useState, useEffect } from "react";
import styles from "./CustomerOrders.module.css";

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

// ==================== TAB BAR ====================
function TabBar({ activeTab, onChangeTab, readOnly = false }) {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabList}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !readOnly && onChangeTab(tab.key)}
            className={
              activeTab === tab.key
                ? styles.tabBtnActive
                : readOnly
                  ? styles.tabBtnReadOnly
                  : styles.tabBtn
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== CHI TIET DON HANG ── ====================
function ChiTietView({ idDH, activeTab, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // const result = await apiGetChiTiet(idDH);
        // setData(result);
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

  if (loading) return <div className={styles.textCenter}>Đang tải...</div>;
  if (error) return <div className={styles.alertDanger}>{error}</div>;

  return (
    <div>
      <TabBar activeTab={activeTab} onChangeTab={onBack} readOnly />

      <div className={styles.detailCard}>
        {/* Mã đơn */}
        <div className={styles.detailHeader}>
          Mã đơn hàng: <span className={styles.detailOrderId}>{data.idDH}</span>
        </div>

        {/* Địa chỉ + thời gian */}
        <div className={styles.detailMeta}>
          <div className={styles.detailAddress}>
            <p className={styles.detailAddressLabel}>Địa chỉ nhận hàng</p>
            <p className={styles.detailCustomerName}>
              {data.tenKhachHang}
              <span className={styles.detailCustomerPhone}>{data.sdt}</span>
            </p>
            <p className={styles.detailCustomerAddr}>{data.diaChi}</p>
          </div>
          <div className={styles.detailTime}>
            <strong>Thời gian đặt</strong>
            <span>{data.thoiGian}</span>
          </div>
        </div>

        {/* Sản phẩm */}
        <h3 className={styles.detailItemsTitle}>Các sản phẩm</h3>

        {data.items.length === 0 ? (
          <div className={styles.textCenter}>Không có sản phẩm</div>
        ) : (
          data.items.map((item) => (
            <div key={item.idsp} className={styles.detailItem}>
              <img
                src={item.hinh || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150"}
                alt={item.tensp}
                className={styles.detailItemImg}
              />
              <div className={styles.detailItemInfo}>
                <p className={styles.detailItemName}>{item.tensp}</p>
                <p className={styles.detailItemQty}>Số lượng: {item.sl}</p>
              </div>
              <div className={styles.detailItemPrice}>
                {(item.gia ?? 0).toLocaleString("vi-VN")} đ
              </div>
            </div>
          ))
        )}

        {/* Tổng tiền */}
        <div className={styles.detailTotal}>
          <span>Tổng tiền hàng</span>
          <span className={styles.detailTotalValue}>
            {tongTien.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className={styles.detailBack}>
          <button className={styles.btnBack} onClick={onBack}>← Quay lại</button>
        </div>
      </div>
    </div>
  );
}

// ==================== ORDER CARD ====================
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
      className={clickable ? styles.orderCardClickable : styles.orderCard}
      onClick={clickable ? () => onViewDetail(item.idDH) : undefined}
    >
      <img
        src={img}
        alt={item.tensp}
        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150"; }}
        className={styles.orderImg}
      />
      <div className={styles.orderInfo}>
        <div className={styles.orderName}>{item.tensp}</div>
        {tab !== "cancelled" && (
          <div className={styles.orderMeta}>Thành tiền: {tongTien} VNĐ</div>
        )}
        {item.ngayBan && <div className={styles.orderDate}>{item.ngayBan}</div>}
      </div>
      <span
        className={styles.statusBadge}
        style={{ background: statusMap.bg, color: statusMap.color }}
      >
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
      setItems([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  return (
    <div>
      <h1 className={styles.pageTitle}>Đơn hàng của tôi</h1>

      <div className={styles.listPanel}>
        <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className={styles.listBody}>
          {error && <div className={styles.alertDanger}>{error}</div>}

          {loading ? (
            <div className={styles.textCenter}>Đang tải...</div>
          ) : items.length === 0 ? (
            <div className={styles.textCenter}>Chưa có đơn hàng nào ở trạng thái này.</div>
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

// ==================== MAIN ====================
export function CustomerOrders() {
  const [view, setView] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab] = useState("pending");

  const handleViewDetail = (idDH) => {
    setSelectedId(idDH);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedId(null);
  };

  return (
    <div className={styles.wrapper}>
      {view === "detail" ? (
        <ChiTietView idDH={selectedId} activeTab={activeTab} onBack={handleBack} />
      ) : (
        <ListView onViewDetail={handleViewDetail} />
      )}
    </div>
  );
}