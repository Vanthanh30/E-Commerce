import { useState, useEffect } from "react";

// ==================== CONSTANTS ====================
const TABS = [
    { key: "confirm", label: "Chờ xác nhận" },
    { key: "pack", label: "Chờ gửi hàng" },
    { key: "ship", label: "Đang giao" },
    { key: "done", label: "Đã giao" },
    { key: "cancel", label: "Đã hủy" },
];

const STATUS_MAP = {
    confirm: { label: "Chờ xác nhận", bg: "#FFF8E1", color: "#F59E0B" },
    pack: { label: "Chờ gửi hàng", bg: "#EDE9FE", color: "#7C3AED" },
    ship: { label: "Đang giao", bg: "#E0F2FE", color: "#0284C7" },
    done: { label: "Hoàn tất", bg: "#DCFCE7", color: "#16A34A" },
    cancel: { label: "Đã hủy", bg: "#FFEBEE", color: "#DC2626" },
};

// ==================== API HELPERS ====================
const BASE_URL = "/api/donHang";

async function apiGetByTab(tab) {
    const res = await fetch(`${BASE_URL}?tab=${tab}`);
    if (!res.ok) throw new Error("Không thể tải đơn hàng");
    return res.json();
}
async function apiGetDetail(idDH) {
    const res = await fetch(`${BASE_URL}/${idDH}/chiTiet`);
    if (!res.ok) throw new Error("Không thể tải chi tiết đơn hàng");
    return res.json();
}
async function apiXacNhan(idDH) {
    const res = await fetch(`${BASE_URL}/${idDH}/xacNhan`, { method: "POST" });
    if (!res.ok) throw new Error("Xác nhận thất bại");
}
async function apiDaLayHang(idDH) {
    const res = await fetch(`${BASE_URL}/${idDH}/daLayHang`, { method: "POST" });
    if (!res.ok) throw new Error("Cập nhật thất bại");
}
async function apiHuyDon(idDH) {
    const res = await fetch(`${BASE_URL}/${idDH}/huy`, { method: "POST" });
    if (!res.ok) throw new Error("Hủy đơn thất bại");
}

// ==================== COMPONENTS ====================

// --- StatusBadge ---
function StatusBadge({ tab }) {
    const s = STATUS_MAP[tab] || STATUS_MAP.confirm;
    return (
        <span style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: s.bg, color: s.color, whiteSpace: "nowrap",
        }}>
            {s.label}
        </span>
    );
}

// --- OrderCard ---
function OrderCard({ item, tab, onAction, onDetail }) {
    const [loading, setLoading] = useState(false);

    const handle = async (fn) => {
        setLoading(true);
        try { await fn(item.idDH); onAction(); }
        catch (e) { alert(e.message); }
        finally { setLoading(false); }
    };

    const fallbackImg = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100";

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 16,
            background: "#fff", borderRadius: 8, padding: "14px 18px",
            marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            flexWrap: "wrap",
        }}>
            <img
                src={item.hinh || fallbackImg}
                alt=""
                style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                onError={e => { e.target.src = fallbackImg; }}
            />
            <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.tensp}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {item.ngayBan && <span>{item.ngayBan} · </span>}
                    {item.sl && item.gia &&
                        <span>{Number(item.sl * item.gia).toLocaleString("vi-VN")} VNĐ</span>
                    }
                </div>
            </div>

            <StatusBadge tab={tab} />

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onDetail(item)}
                    disabled={loading}
                >
                    Chi tiết
                </button>

                {tab === "confirm" && (
                    <>
                        <button className="btn btn-primary btn-sm" disabled={loading}
                            onClick={() => handle(apiXacNhan)}>
                            Xác nhận TT
                        </button>
                        <button className="btn btn-sm" disabled={loading}
                            style={{ background: "#f3f4f6", color: "#374151" }}
                            onClick={() => handle(apiHuyDon)}>
                            Hủy đơn
                        </button>
                    </>
                )}

                {tab === "pack" && (
                    <button className="btn btn-primary btn-sm" disabled={loading}
                        onClick={() => handle(apiDaLayHang)}>
                        Đã giao cho vận chuyển
                    </button>
                )}
            </div>
        </div>
    );
}

// --- DetailView ---
function DetailView({ item, onBack }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                // const data = await apiGetDetail(item.idDH);
                // setDetail(data);
                // Mock data — xóa khi kết nối API thật
                setDetail({
                    idDH: item.idDH,
                    tenKhachHang: item.tenKhachHang || "Khách hàng",
                    sdt: item.sdt || "—",
                    diaChi: item.diaChi || "—",
                    thoiGian: item.ngayBan || "—",
                    sanPhams: [],
                });
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [item]);

    const handleHuy = async () => {
        if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
        setCancelling(true);
        try {
            // await apiHuyDon(item.idDH);
            onBack(true);
        } catch (e) {
            alert(e.message);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    const tongTien = detail.sanPhams.reduce((s, i) => s + (i.gia || 0) * (i.sl || 0), 0);

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onBack(false)}>
                        ← Quay lại
                    </button>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Chi tiết đơn hàng</h1>
                </div>
                <p style={{ margin: 0, color: "#6b7280" }}>Mã đơn hàng: <strong>{detail.idDH}</strong></p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                {[
                    { label: "Tổng tiền", value: Number(tongTien).toLocaleString("vi-VN") + " VNĐ", featured: true },
                    { label: "Khách hàng", value: detail.tenKhachHang },
                    { label: "Thời gian", value: detail.thoiGian },
                ].map(({ label, value, featured }) => (
                    <div key={label} style={{
                        flex: 1, minWidth: 160, padding: "16px 20px", borderRadius: 8,
                        background: featured ? "var(--primary, #3d5a3e)" : "#fff",
                        color: featured ? "#fff" : "#111",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    }}>
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</div>
                        <strong style={{ fontSize: featured ? 20 : 16 }}>{value}</strong>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="card p-4" style={{ marginBottom: 20, maxWidth: 700 }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Số điện thoại</label>
                        <input className="form-control" value={detail.sdt} disabled />
                    </div>
                    <div style={{ flex: 2, minWidth: 200 }}>
                        <label style={{ fontSize: 13, color: "#6b7280", display: "block", marginBottom: 4 }}>Địa chỉ nhận hàng</label>
                        <input className="form-control" value={detail.diaChi} disabled />
                    </div>
                </div>
            </div>

            {/* Product table */}
            <div className="table-responsive" style={{ marginBottom: 24 }}>
                <table className="table table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detail.sanPhams.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", color: "#6b7280", padding: "24px 0" }}>
                                    Không có sản phẩm trong đơn hàng
                                </td>
                            </tr>
                        ) : (
                            detail.sanPhams.map((sp, i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <img
                                                src={sp.hinh || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100"}
                                                alt=""
                                                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                                            />
                                            <div>
                                                <strong>{sp.tensp}</strong>
                                                <small style={{ display: "block", color: "#6b7280" }}>{sp.idsp}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{sp.sl}</td>
                                    <td>{Number(sp.gia).toLocaleString("vi-VN")} VNĐ</td>
                                    <td>{Number((sp.gia || 0) * (sp.sl || 0)).toLocaleString("vi-VN")} VNĐ</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    className="btn btn-sm"
                    style={{ background: "#ef4444", color: "#fff" }}
                    onClick={handleHuy}
                    disabled={cancelling}
                >
                    {cancelling ? "Đang hủy..." : "🗑 Hủy đơn"}
                </button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onBack(false)}>
                    Đóng
                </button>
            </div>
        </div>
    );
}

// --- ListView ---
function ListView({ tab, onDetail }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            // const data = await apiGetByTab(tab);
            // setItems(data);
            setItems([]); // Xóa khi kết nối API thật
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [tab]);

    return (
        <div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Đang tải...</div>
            ) : items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
                    Không có đơn hàng.
                </div>
            ) : (
                items.map((item) => (
                    <OrderCard
                        key={item.idDH}
                        item={item}
                        tab={tab}
                        onAction={load}
                        onDetail={onDetail}
                    />
                ))
            )}
        </div>
    );
}

// ==================== MAIN ====================
export function AdminOrders() {
    const [tab, setTab] = useState("confirm");
    const [detailItem, setDetailItem] = useState(null);

    const handleBack = (shouldReload) => {
        setDetailItem(null);
    };

    if (detailItem) {
        return (
            <div className="container-fluid py-4 px-4">
                <DetailView item={detailItem} onBack={handleBack} />
            </div>
        );
    }

    return (
        <div className="container-fluid py-4 px-4">
            {/* Page header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: 700 }}>Danh sách đơn hàng</h1>
                <p style={{ margin: 0, color: "#6b7280" }}>Xác nhận thanh toán và xử lý đơn mới.</p>
            </div>

            {/* Tabs */}
            <div style={{
                display: "flex", gap: 4, marginBottom: 24,
                borderBottom: "2px solid #e5e7eb", flexWrap: "wrap",
            }}>
                {TABS.map(({ key, label }) => {
                    const active = tab === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            style={{
                                padding: "10px 18px",
                                border: "none",
                                cursor: "pointer",
                                background: "transparent",
                                fontWeight: active ? 700 : 400,
                                color: active ? "var(--primary, #3d5a3e)" : "#6b7280",
                                borderBottom: active ? "2px solid var(--primary, #3d5a3e)" : "2px solid transparent",
                                marginBottom: -2,
                                fontSize: 14,
                                transition: "all 0.15s",
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* List */}
            <ListView tab={tab} onDetail={setDetailItem} />
        </div>
    );
}