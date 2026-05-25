import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import "./BiddingDetails.css";

import { bargainService } from "../../../services/admin/bargainService";

const mapToFrontend = (b) => ({
    idTraGia: b.bargainId,
    soLan: 1, // Placeholder since backend might not support `soLan` yet
    soLanCuoi: 1,
    tenSanPham: b.productName,
    traGia: { idKhachHang: b.customerName },
    soLuong: b.quantity,
    gia: b.price,
    giaBan: b.price, // Optional if missing
    thoiGian: b.createdAt ? new Date(b.createdAt).toLocaleString("vi-VN") : "",
    trangThai: b.status === 2 ? "Đã chấp nhận" : b.status === 3 ? "Từ chối" : "Đang chờ",
    ghiChu: b.note || ""
});

async function apiGetAll() {
    const data = await bargainService.getAll();
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
        if (item.trangThai === "Đã chấp nhận") return { text: "Đã chấp nhận", cls: "bd-badge-accepted" };
        if (item.trangThai === "Từ chối") return { text: "Từ chối", cls: "bd-badge-rejected" };
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGetOne(selected.idTraGia);
                setItem(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selected]);

    if (loading) return <div className="bd-loading">Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="bd-wrapper">
            <div className="bd-sub-header">
                <div className="bd-sub-header-row">
                    <h1>Chi Tiết Trả Giá</h1>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")} style={{ display: "flex", alignItems: "center", gap: "6px" }}><ArrowLeft size={16} /> Quay Lại</button>
                </div>
            </div>
            <div className="bd-detail-card">
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
                    <button className="btn btn-warning" onClick={() => onNavigate("edit", item)}>Sửa</button>
                    <button className="btn btn-danger" onClick={() => onNavigate("delete", item)}>Xóa</button>
                    <button className="btn btn-outline-secondary" onClick={() => onNavigate("list")}>Quay Lại Danh Sách</button>
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