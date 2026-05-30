import React, { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import "./BiddingDetails.css";

import { bargainService } from "../../../services/admin/bargainService";

const mapToFrontend = (b) => ({
    idTraGia: b.bargainId,
    soLan: b.round || 0,
    soLanCuoi: b.round || 0,
    tenSanPham: b.productName,
    traGia: { idKhachHang: b.customerName },
    soLuong: b.quantity,
    gia: b.offerPrice,
    giaBan: b.botPrice || b.offerPrice,
    giaDeXuat: b.suggestedBotPrice,
    thoiGian: b.time ? new Date(b.time).toLocaleString("vi-VN") : "",
    trangThai:
        b.sessionStatus === "expired" ? "Het han" :
        b.sessionStatus === "accepted" ? "Da chap nhan" :
        b.sessionStatus === "rejected" ? "Tu choi" :
        b.status === "countered" ? "Cho khach phan hoi" :
        b.status === "pending" ? "Cho khach phan hoi" :
        "Dang cho admin",
    ghiChu: b.note || ""
});

async function apiGetAll() {
    const data = await bargainService.getAll({ admin: "true" });
    return data.map(mapToFrontend);
}
async function apiGetOne(idTraGia) {
    const data = await bargainService.getById(idTraGia);
    return mapToFrontend(data);
}
async function apiCreate(data) {
    return bargainService.create({
        productId: data.idTraGia, // Mapping logic might need adjustment based on actual DB
        quantity: data.soLuong,
        price: data.gia,
        note: data.ghiChu
    });
}
async function apiUpdate(idTraGia, status) {
    return bargainService.respond(idTraGia, status);
}

// --- FormField ---
function FormField({ label, name, type = "text", value, onChange, error, required, disabled, className = "" }) {
    return (
        <div className={`bd-field ${className}`}>
            <label className={disabled ? "disabled-label" : ""}>
                {label} {required && <span className="req">*</span>}
            </label>
            <input
                type={type}
                name={name}
                className={`form-control ${error ? "is-invalid" : ""}`}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
            {error && <div className="invalid-feedback" style={{ display: "block" }}>{error}</div>}
        </div>
    );
}

// --- SelectField ---
function SelectField({ label, name, value, onChange, error, required, options, className = "" }) {
    return (
        <div className={`bd-field ${className}`}>
            <label>
                {label} {required && <span className="req">*</span>}
            </label>
            <select
                name={name}
                className={`form-control ${error ? "is-invalid" : ""}`}
                value={value}
                onChange={onChange}
            >
                <option value="">-- Chọn ID Trả Giá --</option>
                {options.map((o) => (
                    <option key={o.id} value={o.id}>{o.id}</option>
                ))}
            </select>
            {error && <div className="invalid-feedback" style={{ display: "block" }}>{error}</div>}
        </div>
    );
}

// --- DetailRow ---
function DetailRow({ label, value, className = "" }) {
    return (
        <div className={`bd-detail-row ${className}`}>
            <dt>{label}</dt>
            <dd>{value || "—"}</dd>
        </div>
    );
}

// --- BidCard (item trong danh sách) ---
function BidCard({ item, onClick }) {
    const statusLabel = (() => {
        if (!item.trangThai) return null;
        if (item.trangThai === "Da chap nhan") return { text: "Da chap nhan", cls: "bd-badge-accepted" };
        if (item.trangThai === "Tu choi") return { text: "Tu choi", cls: "bd-badge-rejected" };
        if (item.trangThai === "Het han") return { text: "Het han", cls: "bd-badge-expired" };
        return { text: item.trangThai, cls: "bd-badge-pending" };
    })();

    const soLanLabel = item.soLan
        ? item.soLan === item.soLanCuoi
            ? `Mặc cả lần cuối · ${item.thoiGian}`
            : `Mặc cả lần ${item.soLan} · ${item.thoiGian}`
        : item.thoiGian;

    return (
        <div className="bd-card" onClick={() => onClick(item)}>
            <div className="bd-card-img">
                {item.anhSanPham
                    ? <img src={item.anhSanPham} alt={item.tenSanPham} />
                    : <div className="bd-card-img-placeholder" />}
            </div>
            <div className="bd-card-body">
                <p className="bd-card-name">{item.tenSanPham || `Yêu cầu #${item.idTraGia}`}</p>
                <p className="bd-card-meta">
                    KH: {item.traGia?.idKhachHang || item.idKhachHang || "—"} · SL: {item.soLuong}
                </p>
                <p className="bd-card-price">
                    Đề nghị: {Number(item.gia).toLocaleString("vi-VN")}đ · Giá bán: {Number(item.giaBan || 0).toLocaleString("vi-VN")}đ
                </p>
                <p className="bd-card-footer">
                    {statusLabel && (
                        <span className={`bd-badge ${statusLabel.cls}`}>{statusLabel.text}</span>
                    )}
                    <span className="bd-card-time">{soLanLabel}</span>
                </p>
            </div>
        </div>
    );
}

// --- ListView ---
function ListView({ onNavigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiGetAll();
                setItems(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="bd-wrapper">
            <div className="bd-page-header">
                <div>
                    <h1>Danh sách yêu cầu mặc cả</h1>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="bd-loading">Đang tải...</div>
            ) : items.length === 0 ? (
                <div className="bd-empty">Không có dữ liệu</div>
            ) : (
                <div className="bd-card-list">
                    {items.map((item) => (
                        <BidCard
                            key={`${item.idTraGia}-${item.soLan}`}
                            item={item}
                            onClick={(item) => onNavigate("details", item)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// --- CreateView ---
function CreateView({ onNavigate }) {
    const EMPTY_FORM = { idTraGia: "", soLan: "", gia: "", soLuong: "", thoiGian: "", ghiChu: "", trangThai: "" };
    const [form, setForm] = useState(EMPTY_FORM);
    const [traGiaList, setTraGiaList] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.idTraGia) e.idTraGia = "Vui lòng chọn ID Trả Giá";
        if (!form.soLan) e.soLan = "Vui lòng nhập số lần";
        if (!form.gia) e.gia = "Vui lòng nhập giá";
        if (!form.soLuong) e.soLuong = "Vui lòng nhập số lượng";
        if (!form.thoiGian) e.thoiGian = "Vui lòng nhập thời gian";
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            await apiCreate(form);
            onNavigate("list");
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bd-wrapper">
            <div className="bd-sub-header">
                <div className="bd-sub-header-row">
                    <h1>Tạo Chi Tiết Trả Giá</h1>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")} style={{ display: "flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Quay Lại</button>
                </div>
                <p>Thêm lần trả giá mới cho yêu cầu.</p>
            </div>
            <div className="bd-form-card">
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="bd-form-grid">
                        <SelectField label="ID Trả Giá" name="idTraGia" value={form.idTraGia} onChange={handleChange} error={errors.idTraGia} required options={traGiaList} />
                        <FormField label="Số Lần" name="soLan" type="number" value={form.soLan} onChange={handleChange} error={errors.soLan} required />
                        <FormField label="Giá (VNĐ)" name="gia" type="number" value={form.gia} onChange={handleChange} error={errors.gia} required />
                        <FormField label="Số Lượng" name="soLuong" type="number" value={form.soLuong} onChange={handleChange} error={errors.soLuong} required />
                        <FormField label="Thời Gian" name="thoiGian" type="datetime-local" value={form.thoiGian} onChange={handleChange} error={errors.thoiGian} required />
                        <FormField label="Trạng Thái" name="trangThai" value={form.trangThai} onChange={handleChange} />
                        <FormField label="Ghi Chú" name="ghiChu" value={form.ghiChu} onChange={handleChange} className="bd-field-full" />
                    </div>
                    <div className="bd-form-actions">
                        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Đang lưu..." : "Tạo Mới"}</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => onNavigate("list")}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- EditView ---
function EditView({ selected, onNavigate }) {
    const EMPTY_FORM = { idTraGia: "", soLan: "", gia: "", soLuong: "", thoiGian: "", ghiChu: "", trangThai: "" };
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setForm({ ...EMPTY_FORM, ...selected });
            } catch (e) {
                setErrors({ _global: e.message });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selected]);

    const validate = () => {
        const e = {};
        if (!form.gia) e.gia = "Vui lòng nhập giá";
        if (!form.soLuong) e.soLuong = "Vui lòng nhập số lượng";
        if (!form.thoiGian) e.thoiGian = "Vui lòng nhập thời gian";
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            let statusVal = 1;
            if (form.trangThai === "Đã chấp nhận") statusVal = 2;
            else if (form.trangThai === "Từ chối") statusVal = 3;

            await apiUpdate(form.idTraGia, statusVal);
            onNavigate("list");
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="bd-loading">Đang tải...</div>;

    return (
        <div className="bd-wrapper">
            <div className="bd-sub-header">
                <div className="bd-sub-header-row">
                    <h1>Chỉnh Sửa Chi Tiết Trả Giá</h1>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")} style={{ display: "flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Quay Lại</button>
                </div>
                <p>Cập nhật thông tin lần trả giá.</p>
            </div>
            <div className="bd-form-card">
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="bd-form-grid">
                        <FormField label="ID Trả Giá" name="idTraGia" value={form.idTraGia} disabled />
                        <FormField label="Số Lần" name="soLan" value={form.soLan} disabled />
                        <FormField label="Giá (VNĐ)" name="gia" type="number" value={form.gia} onChange={handleChange} error={errors.gia} required />
                        <FormField label="Số Lượng" name="soLuong" type="number" value={form.soLuong} onChange={handleChange} error={errors.soLuong} required />
                        <FormField label="Thời Gian" name="thoiGian" type="datetime-local" value={form.thoiGian} onChange={handleChange} error={errors.thoiGian} required />
                        <FormField label="Trạng Thái" name="trangThai" value={form.trangThai} onChange={handleChange} />
                        <FormField label="Ghi Chú" name="ghiChu" value={form.ghiChu} onChange={handleChange} className="bd-field-full" />
                    </div>
                    <div className="bd-form-actions">
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: "flex", alignItems: "center", gap: "6px" }}>{submitting ? "Đang lưu..." : <><Save size={16} /> Lưu</>}</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => onNavigate("list")}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- DetailsView ---
function DetailsView({ selected, onNavigate }) {
    const [item, setItem] = useState(null);
    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [counterPrice, setCounterPrice] = useState("");
    const [counterNote, setCounterNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadDetails = async () => {
        try {
            setError(null);
            const data = await bargainService.getById(selected.idTraGia);
            if (Array.isArray(data) && data.length > 0) {
                const sorted = [...data].sort((a, b) => Number(a.round || 0) - Number(b.round || 0));
                setRounds(sorted);
                const latest = sorted[sorted.length - 1];
                setItem(latest);
                if (!counterPrice) {
                    setCounterPrice(latest.suggestedBotPrice || latest.botPrice || latest.listedPrice || "");
                }
            } else {
                setError("Không tìm thấy dữ liệu thương lượng.");
            }
        } catch (e) {
            setError(e.message || "Lỗi tải chi tiết phiên mặc cả.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetails();
    }, [selected]);

    const handleAction = async (action, additionalData = {}) => {
        if (!item) return;
        setSubmitting(true);
        setError(null);
        try {
            const body = {
                action,
                round: item.round,
                quantity: item.quantity,
                ...additionalData
            };
            await bargainService.respond(item.bargainId, body);
            setCounterPrice("");
            setCounterNote("");
            await loadDetails();
        } catch (err) {
            setError(err.message || "Không thể thực hiện hành động.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="bd-loading">Đang tải chi tiết...</div>;
    if (error && !item) return <div className="alert alert-danger m-3">{error}</div>;
    if (!item) return <div className="bd-empty">Không tìm thấy thông tin phiên mặc cả</div>;

    const imgUrl = item.imageUrl
        ? item.imageUrl.startsWith("http")
            ? item.imageUrl
            : `/Uploads/${item.imageUrl}`
        : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=240";

    const isFinished = ["accepted", "rejected", "expired"].includes(item.sessionStatus);
    const canAdminRespond = item.status === "pending";

    return (
        <div className="bd-wrapper">
            <div className="bd-sub-header">
                <div className="bd-sub-header-row">
                    <h1>Chi Tiết & Hội Thoại Thương Lượng</h1>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")} style={{ display: "flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Quay Lại</button>
                </div>
                <p>Mã phiên: <strong>{item.bargainId}</strong></p>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="bd-split-container">
                {/* CỘT TRÁI: THÔNG TIN SẢN PHẨM & KHÁCH HÀNG */}
                <div className="bd-left-panel">
                    <div className="bd-panel-card">
                        <h3>Thông tin sản phẩm</h3>
                        <div className="bd-product-info-wrap">
                            <img src={imgUrl} alt={item.productName} className="bd-product-img" />
                            <div className="bd-product-meta-details">
                                <h4 className="bd-product-title">{item.productName}</h4>
                                <span className="bd-product-sku">Mã SP: {item.productId}</span>
                                <div className="bd-price-row">
                                    <div className="bd-price-box">
                                        <span className="bd-price-label">Giá niêm yết</span>
                                        <span className="bd-price-value fixed">{Number(item.listedPrice || 0).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    <div className="bd-price-box">
                                        <span className="bd-price-label">Mức giảm tối đa (Giá sàn)</span>
                                        <span className="bd-price-value min">
                                            {(() => {
                                                const minPrice = item.minPrice || 0;
                                                const listed = item.listedPrice || 0;
                                                if (minPrice > 100) {
                                                    const pct = listed > 0 ? Math.round((1 - minPrice / listed) * 100) : 0;
                                                    return `${pct}% (${Number(minPrice).toLocaleString("vi-VN")} đ)`;
                                                } else {
                                                    const val = listed * (1 - minPrice / 100);
                                                    return `${minPrice}% (${Number(val).toLocaleString("vi-VN")} đ)`;
                                                }
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bd-panel-card">
                        <h3>Thông tin khách hàng</h3>
                        <dl className="bd-customer-list">
                            <dt>Họ và tên</dt>
                            <dd>{item.customerName || "—"}</dd>
                            <dt>Mã khách hàng</dt>
                            <dd><code>{item.customerId}</code></dd>
                            <dt>Địa chỉ nhận hàng</dt>
                            <dd>{item.address || "—"}</dd>
                        </dl>
                    </div>

                    <div className="bd-panel-card">
                        <h3>Tổng quan phiên đàm phán</h3>
                        <dl className="bd-overview-list">
                            <dt>Số lượng thương lượng</dt>
                            <dd><strong>{item.quantity}</strong> sản phẩm</dd>
                            <dt>Thời gian tạo</dt>
                            <dd>{item.time ? new Date(item.time).toLocaleString("vi-VN") : "—"}</dd>
                            <dt>Thời gian hết hạn</dt>
                            <dd>{item.expiredAt ? new Date(item.expiredAt).toLocaleString("vi-VN") : "—"}</dd>
                            <dt>Vòng hiện tại</dt>
                            <dd><span className="bd-round-badge">Vòng {item.round} / 3</span></dd>
                            <dt>Trạng thái tổng thể</dt>
                            <dd>
                                <span className={`bd-status-pill ${item.sessionStatus}`}>
                                    {item.sessionStatus === "accepted" ? "Đã chấp nhận" :
                                     item.sessionStatus === "rejected" ? "Từ chối" :
                                     item.sessionStatus === "expired" ? "Hết hạn" : "Đang thương lượng"}
                                </span>
                            </dd>
                        </dl>
                    </div>
                </div>

                {/* CỘT PHẢI: GIAO DIỆN CHAT VỚI CLIENT */}
                <div className="bd-right-panel">
                    <div className="bd-chat-header-bar">
                        <div className="bd-chat-header-avatar">💬</div>
                        <div>
                            <h4>Hội thoại mặc cả</h4>
                            <p>Đang nhắn với {item.customerName || "Khách hàng"}</p>
                        </div>
                    </div>

                    <div className="bd-chat-messages-area">
                        {rounds.map((round, idx) => (
                            <React.Fragment key={idx}>
                                {/* Bong bóng của khách hàng */}
                                <div className="bd-chat-msg-row customer">
                                    <div className="bd-chat-avatar">KH</div>
                                    <div className="bd-chat-bubble customer">
                                        <div className="bd-chat-bubble-title">Đề xuất mua</div>
                                        <div className="bd-chat-price">{Number(round.offerPrice || 0).toLocaleString("vi-VN")} đ</div>
                                        {round.customerMessage && (
                                            <p className="bd-chat-text">{round.customerMessage}</p>
                                        )}
                                        <span className="bd-chat-time">{new Date(round.time).toLocaleTimeString("vi-VN")}</span>
                                    </div>
                                </div>

                                {/* Bong bóng của shop/hệ thống */}
                                {(round.botPrice || round.botMessage || round.status !== "pending") && (
                                    <div className="bd-chat-msg-row shop">
                                        <div className="bd-chat-bubble shop">
                                            <div className="bd-chat-bubble-title">Shop phản hồi</div>
                                            {round.status === "accepted" ? (
                                                <div className="bd-chat-status text-success">✓ Đã chấp nhận bán giá: {Number(round.botPrice || round.offerPrice).toLocaleString("vi-VN")} đ</div>
                                            ) : round.status === "rejected" ? (
                                                <div className="bd-chat-status text-danger">✗ Đã từ chối mức giá này</div>
                                            ) : (
                                                <div className="bd-chat-price shop-offer">Đề xuất lại: {Number(round.botPrice || 0).toLocaleString("vi-VN")} đ</div>
                                            )}
                                            {round.botMessage && (
                                                <p className="bd-chat-text">{round.botMessage}</p>
                                            )}
                                            <span className="bd-chat-time">{new Date(round.time).toLocaleTimeString("vi-VN")}</span>
                                        </div>
                                        <div className="bd-chat-avatar shop">AT</div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* BẢNG ĐIỀU KHIỂN PHẢN HỒI (ADMIN ACTIONS) */}
                    <div className="bd-chat-action-panel">
                        {isFinished ? (
                            <div className="bd-resolved-message">
                                <span className="icon">🔒</span>
                                <div>
                                    <h5>Phiên mặc cả đã đóng</h5>
                                    <p>
                                        {item.sessionStatus === "accepted" ? "Hai bên đã thống nhất giao dịch thành công." :
                                         item.sessionStatus === "rejected" ? "Phiên mặc cả đã bị từ chối." :
                                         "Phiên mặc cả đã hết hạn thời gian đàm phán."}
                                    </p>
                                </div>
                            </div>
                        ) : !canAdminRespond ? (
                            <div className="bd-resolved-message">
                                <span className="icon">...</span>
                                <div>
                                    <h5>Dang cho khach hang phan hoi</h5>
                                    <p>Shop da tra loi vong nay. Khach hang can gui muc gia tiep theo truoc khi admin co the xu ly tiep.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bd-admin-action-controls">
                                <h5>Hành động của Admin (Vòng {item.round}/3)</h5>
                                <div className="bd-quick-action-buttons">
                                    <button 
                                        className="btn btn-success" 
                                        onClick={() => handleAction("accept", { price: item.offerPrice })}
                                        disabled={submitting}
                                    >
                                        Đồng ý bán ({Number(item.offerPrice || 0).toLocaleString("vi-VN")}đ)
                                    </button>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => handleAction("reject")}
                                        disabled={submitting}
                                    >
                                        Từ chối mặc cả
                                    </button>
                                </div>

                                {item.round < 3 ? (
                                    <div className="bd-counter-offer-section">
                                        <h6>Đề xuất mức giá khác (Counter Offer)</h6>
                                        <div className="bd-counter-grid">
                                            <div className="bd-input-group">
                                                <label>Giá đề xuất lại (VNĐ)</label>
                                                <input 
                                                    type="number" 
                                                    value={counterPrice} 
                                                    onChange={(e) => setCounterPrice(e.target.value)} 
                                                    placeholder="Nhập giá VNĐ..."
                                                    disabled={submitting}
                                                />
                                            </div>
                                            <div className="bd-input-group full-width">
                                                <label>Lời nhắn tới khách hàng</label>
                                                <textarea 
                                                    rows="2"
                                                    value={counterNote}
                                                    onChange={(e) => setCounterNote(e.target.value)}
                                                    placeholder="Nhập ghi chú phản hồi..."
                                                    disabled={submitting}
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            className="btn btn-primary w-100 mt-2" 
                                            onClick={() => handleAction("counter", { price: Number(counterPrice), note: counterNote })}
                                            disabled={submitting || !counterPrice}
                                        >
                                            {submitting ? "Đang gửi..." : "Gửi đề xuất giá mới"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bd-warning-limit">
                                        ⚠️ Đã đạt giới hạn 3 vòng đàm phán tối đa. Chỉ có thể chọn Đồng ý hoặc Từ chối.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- DeleteView ---
function DeleteView({ selected, onNavigate }) {
    const [item] = useState(selected);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            // Backend does not support deleting bargains yet
            // await apiDelete(item.idTraGia, item.soLan);
            onNavigate("list");
        } catch (e) {
            setError(e.message);
            setDeleting(false);
        }
    };

    return (
        <div className="bd-wrapper">
            <div className="bd-sub-header">
                <div className="bd-sub-header-row">
                    <h1 className="danger">Xóa Chi Tiết Trả Giá</h1>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Quay Lại</button>
                </div>
            </div>
            <div className="alert alert-warning">
                <strong>Cảnh báo:</strong> Bạn có chắc chắn muốn xóa bản ghi này không? Hành động này không thể hoàn tác.
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="bd-detail-card danger-border">
                <dl className="bd-detail-grid">
                    <DetailRow label="ID Trả Giá" value={item.idTraGia} />
                    <DetailRow label="Số Lần" value={item.soLan} />
                    <DetailRow label="Giá" value={Number(item.gia).toLocaleString("vi-VN") + " đ"} />
                    <DetailRow label="Số Lượng" value={item.soLuong} />
                    <DetailRow label="Thời Gian" value={item.thoiGian} />
                    <DetailRow label="Trạng Thái" value={item.trangThai} />
                    <DetailRow label="ID Khách Hàng" value={item.traGia?.idKhachHang} />
                    <DetailRow label="Ghi Chú" value={item.ghiChu} className="full" />
                </dl>
                <div className="bd-form-actions">
                    <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Đang xóa..." : "Xác Nhận Xóa"}</button>
                    <button className="btn btn-outline-secondary" onClick={() => onNavigate("list")} disabled={deleting}>Hủy</button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN ---
function BiddingDetails() {
    const [view, setView] = useState("list");
    const [selected, setSelected] = useState(null);

    const handleNavigate = (target, item = null) => {
        setSelected(item);
        setView(target);
    };

    const renderView = () => {
        switch (view) {
            case "create": return <CreateView onNavigate={handleNavigate} />;
            case "edit": return <EditView selected={selected} onNavigate={handleNavigate} />;
            case "details": return <DetailsView selected={selected} onNavigate={handleNavigate} />;
            case "delete": return <DeleteView selected={selected} onNavigate={handleNavigate} />;
            default: return <ListView onNavigate={handleNavigate} />;
        }
    };

    return <div className="container-fluid p-0">{renderView()}</div>;
}

export default BiddingDetails;
