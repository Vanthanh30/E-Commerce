import { useState, useEffect } from "react";

const EMPTY_FORM = {
    idTraGia: "",
    soLan: "",
    gia: "",
    soLuong: "",
    thoiGian: "",
    ghiChu: "",
    trangThai: "",
};

const BASE_URL = "/api/chiTietTraGia";

async function apiGetAll() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Không thể tải danh sách");
    return res.json();
}
async function apiGetOne(idTraGia, soLan) {
    const res = await fetch(`${BASE_URL}/${idTraGia}/${soLan}`);
    if (!res.ok) throw new Error("Không tìm thấy bản ghi");
    return res.json();
}
async function apiCreate(data) {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Tạo mới thất bại");
    return res.json();
}
async function apiUpdate(idTraGia, soLan, data) {
    const res = await fetch(`${BASE_URL}/${idTraGia}/${soLan}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Cập nhật thất bại");
    return res.json();
}
async function apiDelete(idTraGia, soLan) {
    const res = await fetch(`${BASE_URL}/${idTraGia}/${soLan}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Xóa thất bại");
}

// --- FormField ---
function FormField({ label, name, type = "text", value, onChange, error, required }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <label style={{ width: 160, minWidth: 160, paddingTop: 8, fontWeight: 600, fontSize: 14 }}>
                {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            <div style={{ flex: 1 }}>
                <input
                    type={type}
                    name={name}
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    value={value}
                    onChange={onChange}
                />
                {error && <div className="invalid-feedback" style={{ display: "block" }}>{error}</div>}
            </div>
        </div>
    );
}

// --- DetailRow ---
function DetailRow({ label, value }) {
    return (
        <>
            <div style={{ display: "flex", padding: "8px 0" }}>
                <dt style={{ width: 180, minWidth: 180, color: "#6b7280", fontWeight: 600, margin: 0 }}>{label}</dt>
                <dd style={{ margin: 0 }}>{value || "—"}</dd>
            </div>
            <hr style={{ margin: "4px 0" }} />
        </>
    );
}

// --- ListView ---
function ListView({ onNavigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            // const data = await apiGetAll();
            // setItems(data);
            setItems([]);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h1 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: 700 }}>Danh Sách Chi Tiết Trả Giá</h1>
                    <p style={{ margin: 0, color: "#6b7280" }}>Quản lý các lần trả giá của khách hàng.</p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigate("create")}>
                    + Tạo Mới
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Đang tải...</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Giá</th>
                                <th>Số Lượng</th>
                                <th>Thời Gian</th>
                                <th>Ghi Chú</th>
                                <th>Trạng Thái</th>
                                <th>ID Khách Hàng</th>
                                <th style={{ width: 200 }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", color: "#6b7280", padding: "32px 0" }}>
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={`${item.idTraGia}-${item.soLan}`}>
                                        <td>{Number(item.gia).toLocaleString("vi-VN")} đ</td>
                                        <td>{item.soLuong}</td>
                                        <td>{item.thoiGian}</td>
                                        <td>{item.ghiChu}</td>
                                        <td>
                                            <span className={`badge ${item.trangThai ? "bg-success" : "bg-secondary"}`}>
                                                {item.trangThai || "N/A"}
                                            </span>
                                        </td>
                                        <td>{item.traGia?.idKhachHang}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-info me-1" onClick={() => onNavigate("details", item)}>Chi Tiết</button>
                                            <button className="btn btn-sm btn-outline-warning me-1" onClick={() => onNavigate("edit", item)}>Sửa</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => onNavigate("delete", item)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- CreateView ---
function CreateView({ onNavigate }) {
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
            // await apiCreate(form);
            onNavigate("list");
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")}>
                        ← Quay Lại
                    </button>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Tạo Chi Tiết Trả Giá</h1>
                </div>
                <p style={{ margin: 0, color: "#6b7280" }}>Thêm lần trả giá mới cho yêu cầu.</p>
            </div>

            <div className="card p-4" style={{ maxWidth: 680 }}>
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}

                <form onSubmit={handleSubmit}>
                    {/* idTraGia dropdown */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <label style={{ width: 160, minWidth: 160, paddingTop: 8, fontWeight: 600, fontSize: 14 }}>
                            ID Trả Giá <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <div style={{ flex: 1 }}>
                            <select
                                name="idTraGia"
                                className={`form-control ${errors.idTraGia ? "is-invalid" : ""}`}
                                value={form.idTraGia}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn ID Trả Giá --</option>
                                {traGiaList.map((tg) => (
                                    <option key={tg.id} value={tg.id}>{tg.id}</option>
                                ))}
                            </select>
                            {errors.idTraGia && <div className="invalid-feedback" style={{ display: "block" }}>{errors.idTraGia}</div>}
                        </div>
                    </div>

                    <FormField label="Số Lần" name="soLan" type="number" value={form.soLan} onChange={handleChange} error={errors.soLan} required />
                    <FormField label="Giá (VNĐ)" name="gia" type="number" value={form.gia} onChange={handleChange} error={errors.gia} required />
                    <FormField label="Số Lượng" name="soLuong" type="number" value={form.soLuong} onChange={handleChange} error={errors.soLuong} required />
                    <FormField label="Thời Gian" name="thoiGian" type="datetime-local" value={form.thoiGian} onChange={handleChange} error={errors.thoiGian} required />
                    <FormField label="Ghi Chú" name="ghiChu" value={form.ghiChu} onChange={handleChange} />
                    <FormField label="Trạng Thái" name="trangThai" value={form.trangThai} onChange={handleChange} />

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? "Đang lưu..." : "Tạo Mới"}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => onNavigate("list")}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- EditView ---
function EditView({ selected, onNavigate }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                // const data = await apiGetOne(selected.idTraGia, selected.soLan);
                // setForm(data);
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
            // await apiUpdate(form.idTraGia, form.soLan, form);
            onNavigate("list");
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Đang tải...</div>;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")}>
                        ← Quay Lại
                    </button>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Chỉnh Sửa Chi Tiết Trả Giá</h1>
                </div>
                <p style={{ margin: 0, color: "#6b7280" }}>Cập nhật thông tin lần trả giá.</p>
            </div>

            <div className="card p-4" style={{ maxWidth: 680 }}>
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Readonly fields */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <label style={{ width: 160, minWidth: 160, fontWeight: 600, fontSize: 14, color: "#6b7280" }}>ID Trả Giá</label>
                        <input className="form-control" value={form.idTraGia} disabled style={{ flex: 1 }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <label style={{ width: 160, minWidth: 160, fontWeight: 600, fontSize: 14, color: "#6b7280" }}>Số Lần</label>
                        <input className="form-control" value={form.soLan} disabled style={{ flex: 1 }} />
                    </div>

                    <FormField label="Giá (VNĐ)" name="gia" type="number" value={form.gia} onChange={handleChange} error={errors.gia} required />
                    <FormField label="Số Lượng" name="soLuong" type="number" value={form.soLuong} onChange={handleChange} error={errors.soLuong} required />
                    <FormField label="Thời Gian" name="thoiGian" type="datetime-local" value={form.thoiGian} onChange={handleChange} error={errors.thoiGian} required />
                    <FormField label="Ghi Chú" name="ghiChu" value={form.ghiChu} onChange={handleChange} />
                    <FormField label="Trạng Thái" name="trangThai" value={form.trangThai} onChange={handleChange} />

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? "Đang lưu..." : "💾 Lưu"}
                        </button>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => onNavigate("list")}>
                            Hủy
                        </button>
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
                // const data = await apiGetOne(selected.idTraGia, selected.soLan);
                // setItem(data);
                setItem(selected);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [selected]);

    if (loading) return <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Đang tải...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")}>
                    ← Quay Lại
                </button>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Chi Tiết Trả Giá</h1>
            </div>

            <div className="card p-4" style={{ maxWidth: 680 }}>
                <dl>
                    <DetailRow label="ID Trả Giá" value={item.idTraGia} />
                    <DetailRow label="Số Lần" value={item.soLan} />
                    <DetailRow label="Giá" value={Number(item.gia).toLocaleString("vi-VN") + " đ"} />
                    <DetailRow label="Số Lượng" value={item.soLuong} />
                    <DetailRow label="Thời Gian" value={item.thoiGian} />
                    <DetailRow label="Ghi Chú" value={item.ghiChu} />
                    <DetailRow label="Trạng Thái" value={item.trangThai} />
                    <DetailRow label="ID Khách Hàng" value={item.traGia?.idKhachHang} />
                </dl>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
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
            // await apiDelete(item.idTraGia, item.soLan);
            onNavigate("list");
        } catch (e) {
            setError(e.message);
            setDeleting(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")} disabled={deleting}>
                    ← Quay Lại
                </button>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#dc2626" }}>Xóa Chi Tiết Trả Giá</h1>
            </div>

            <div className="alert alert-warning">
                <strong>Cảnh báo:</strong> Bạn có chắc chắn muốn xóa bản ghi này không? Hành động này không thể hoàn tác.
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card p-4" style={{ maxWidth: 680, border: "1px solid #fca5a5" }}>
                <dl>
                    <DetailRow label="ID Trả Giá" value={item.idTraGia} />
                    <DetailRow label="Số Lần" value={item.soLan} />
                    <DetailRow label="Giá" value={Number(item.gia).toLocaleString("vi-VN") + " đ"} />
                    <DetailRow label="Số Lượng" value={item.soLuong} />
                    <DetailRow label="Thời Gian" value={item.thoiGian} />
                    <DetailRow label="Ghi Chú" value={item.ghiChu} />
                    <DetailRow label="Trạng Thái" value={item.trangThai} />
                    <DetailRow label="ID Khách Hàng" value={item.traGia?.idKhachHang} />
                </dl>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Đang xóa..." : "Xác Nhận Xóa"}
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => onNavigate("list")} disabled={deleting}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- MAIN ---
export function BiddingDetails() {
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

    return (
        <div className="container-fluid py-4 px-4">
            {renderView()}
        </div>
    );
}