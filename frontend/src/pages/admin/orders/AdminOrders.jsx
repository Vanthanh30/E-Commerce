import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { orderService } from "../../../services/admin/orderService";
import "./AdminOrders.css";

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

// ==================== COMPONENTS ====================

function StatusBadge({ tab }) {
    const s = STATUS_MAP[tab] || STATUS_MAP.confirm;

    return (
        <span
            className="status-badge"
            style={{
                background: s.bg,
                color: s.color,
            }}
        >
            {s.label}
        </span>
    );
}

function OrderCard({ item, tab, onDetail, onUpdateStatus }) {
    const fallbackImg =
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100";
    
    const firstProduct = item.items && item.items.length > 0 ? item.items[0] : {};
    const totalItems = item.items ? item.items.length : 0;
    const totalValue = item.items ? item.items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.price)), 0) : 0;

    return (
        <div className="order-card">
            <img
                src={firstProduct?.imageUrl || fallbackImg}
                alt=""
                className="order-image"
                onError={(e) => {
                    e.target.src = fallbackImg;
                }}
            />

            <div className="order-info">
                <div className="order-title">
                    {firstProduct?.productName || "Đơn hàng"}
                    {totalItems > 1 && <span style={{ fontSize: "0.85em", color: "#666", fontWeight: "normal", marginLeft: "4px" }}> (+ {totalItems - 1} sản phẩm khác)</span>}
                </div>

                <div className="order-meta">
                    {item.saleDate && <span>{new Date(item.saleDate).toLocaleString("vi-VN")} · </span>}
                    <span>
                        {Number(totalValue).toLocaleString("vi-VN")} VNĐ
                    </span>
                </div>
            </div>

            <StatusBadge tab={tab} />

            <div className="order-actions">
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onDetail(item)}
                >
                    Chi tiết
                </button>

                {tab === "confirm" && (
                    <>
                        <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(item.orderId, 2)}>
                            Xác nhận TT
                        </button>

                        <button className="btn btn-cancel btn-sm" onClick={() => onUpdateStatus(item.orderId, 5)}>
                            Hủy đơn
                        </button>
                    </>
                )}

                {tab === "pack" && (
                    <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(item.orderId, 3)}>
                        Đã giao cho vận chuyển
                    </button>
                )}
                
                {tab === "ship" && (
                    <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(item.orderId, 4)}>
                        Xác nhận đã giao
                    </button>
                )}
            </div>
        </div>
    );
}

function DetailView({ item, onBack, onUpdateStatus }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setDetail({
            idDH: item.orderId,
            tenKhachHang: item.customerName || "Khách hàng",
            sdt: item.customerId || "—",
            diaChi: item.shippingAddress || "—",
            thoiGian: new Date(item.saleDate).toLocaleString("vi-VN") || "—",
            sanPhams: item.items ? item.items.map(i => ({
                tenSanPham: i.productName,
                soLuong: i.quantity,
                giaThanh: i.price
            })) : []
        });

        setLoading(false);
    }, [item]);

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div>
            <div className="detail-header">
                <div className="detail-title-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <h1 className="detail-title">Chi tiết đơn hàng</h1>
                    
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => onBack(false)}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    >
                        Quay lại <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} /> 
                    </button>
                </div>

                <p className="detail-code">
                    Mã đơn hàng: <strong>{detail.idDH}</strong>
                </p>
            </div>

            <div className="stats-grid">
                <div className="stats-card featured">
                    <div className="stats-label">Khách hàng</div>
                    <strong>{detail.tenKhachHang}</strong>
                </div>

                <div className="stats-card">
                    <div className="stats-label">SĐT</div>
                    <strong>{detail.sdt}</strong>
                </div>

                <div className="stats-card">
                    <div className="stats-label">Thời gian</div>
                    <strong>{detail.thoiGian}</strong>
                </div>
            </div>

            <div className="card p-4 detail-info">
                <div className="detail-inputs">
                    <div className="input-group-custom">
                        <label>Số điện thoại</label>
                        <input
                            className="form-control"
                            value={detail.sdt}
                            disabled
                        />
                    </div>

                    <div className="input-group-custom">
                        <label>Địa chỉ nhận hàng</label>
                        <input
                            className="form-control"
                            value={detail.diaChi}
                            disabled
                        />
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead style={{ backgroundColor: "#FDFBF7", color: "#2D3748", borderBottom: "1px solid #E2E8F0" }}>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>

                    <tbody>
                        {detail.sanPhams.map((sp, idx) => (
                            <tr key={idx}>
                                <td>{sp.tenSanPham}</td>
                                <td>{sp.soLuong}</td>
                                <td>{Number(sp.giaThanh).toLocaleString("vi-VN")} đ</td>
                                <td>{Number(sp.soLuong * sp.giaThanh).toLocaleString("vi-VN")} đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="detail-actions">
                <button 
                    className="btn btn-danger btn-sm" 
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    onClick={() => onUpdateStatus(detail.idDH, 5)}
                >
                    <Trash2 size={16} /> Hủy đơn
                </button>

                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onBack(false)}
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}

function ListView({ tab, onDetail }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            let statusId = 1;
            if (tab === "pack") statusId = 2;
            if (tab === "ship") statusId = 3;
            if (tab === "done") statusId = 4;
            if (tab === "cancel") statusId = 5;

            const data = await orderService.getAll({ status: statusId });
            
            const grouped = {};
            data.forEach(item => {
                if (!grouped[item.orderId]) {
                    grouped[item.orderId] = {
                        orderId: item.orderId,
                        customerId: item.customerId,
                        customerName: item.customerName,
                        saleDate: item.saleDate,
                        shippingAddress: item.shippingAddress,
                        status: item.status,
                        items: []
                    };
                }
                grouped[item.orderId].items.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    productName: item.productName,
                    imageUrl: item.imageUrl
                });
            });
            
            setItems(Object.values(grouped));
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [tab]);

    const handleUpdateStatus = async (orderId, statusId) => {
        try {
            await orderService.updateStatus(orderId, statusId);
            load();
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            alert("Cập nhật thất bại.");
        }
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="empty-orders">
                Không có đơn hàng.
            </div>
        );
    }

    return items.map((item) => (
        <OrderCard
            key={item.orderId}
            item={item}
            tab={tab}
            onDetail={onDetail}
            onUpdateStatus={handleUpdateStatus}
        />
    ));
}

// ==================== MAIN ====================

function AdminOrders() {
    const [tab, setTab] = useState("confirm");
    const [detailItem, setDetailItem] = useState(null);

    const handleDetailUpdateStatus = async (orderId, statusId) => {
        try {
            await orderService.updateStatus(orderId, statusId);
            setDetailItem(null); 
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            alert("Cập nhật thất bại.");
        }
    };

    if (detailItem) {
        return (
            <div className="container-fluid py-4 px-4">
                <DetailView
                    item={detailItem}
                    onBack={() => setDetailItem(null)}
                    onUpdateStatus={handleDetailUpdateStatus}
                />
            </div>
        );
    }

    return (
        <div className="container-fluid py-4 px-4">
            <div className="page-header">
                <h1>Danh sách đơn hàng</h1>

                <p>
                    Xác nhận thanh toán và xử lý đơn mới.
                </p>
            </div>

            <div className="tabs">
                {TABS.map(({ key, label }) => {
                    const active = tab === key;

                    return (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`tab-btn ${active ? "active" : ""}`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            <ListView
                tab={tab}
                onDetail={setDetailItem}
            />
        </div>
    );
}

export default AdminOrders;