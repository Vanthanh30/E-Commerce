import { useState, useEffect } from "react";

const BASE_URL = "/api/danhMuc";
const EMPTY_FORM = { tenDanhMuc: "", moTa: "", trangThai: 1 };

async function apiGetAll() {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Không thể tải danh sách");
    return res.json();
}
async function apiGetOne(id) {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) throw new Error("Không tìm thấy danh mục");
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
async function apiUpdate(id, data) {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Cập nhật thất bại");
    return res.json();
}
async function apiDelete(id) {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Xóa thất bại");
}

// --- DeleteModal ---
function DeleteModal({ item, onConfirm, onCancel, deleting }) {
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
            <div style={{
                background: "#fff", border: "2px solid #3b82f6", borderRadius: 8,
                padding: "1.5rem", width: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Xác nhận xóa!</h2>
                    <span style={{ cursor: "pointer", fontSize: 20, color: "#888" }} onClick={onCancel}>✕</span>
                </div>
                <div style={{ marginBottom: 20 }}>
                    <p style={{ color: "#ef4444", fontWeight: 600, margin: "0 0 6px" }}>
                        Bạn có chắc chắn muốn xóa danh mục <strong>"{item?.tenDanhMuc}"</strong>?
                    </p>
                    <p style={{ color: "#374151", margin: 0, fontSize: 14 }}>
                        Lưu ý: không thể hoàn tác sau khi xác nhận!!
                    </p>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={onCancel} disabled={deleting}
                        style={{ padding: "8px 18px", borderRadius: 4, border: "none", background: "#d1d5db", color: "#374151", cursor: "pointer" }}>
                        Hủy
                    </button>
                    <button onClick={onConfirm} disabled={deleting}
                        style={{ padding: "8px 18px", borderRadius: 4, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer" }}>
                        {deleting ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- ListView ---
function ListView({ onNavigate }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            // const data = await apiGetAll();
            // setItems(data.filter(m => m.trangThai === 1));
            setItems([]);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            // await apiDelete(deleteTarget.idDanhMuc);
            setDeleteTarget(null);
            load();
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h1 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: 700 }}>Quản lý danh mục</h1>
                    <p style={{ margin: 0, color: "#6b7280" }}>Tổ chức bộ sưu tập nội thất theo danh mục.</p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigate("create")}>
                    + Thêm danh mục
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Đang tải...</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle" style={{ width: "100%" }}>
                        <thead className="table-dark">
                            <tr>
                                <th>Mã danh mục</th>
                                <th>Tên danh mục</th>
                                <th style={{ width: 120 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center", color: "#6b7280", padding: "32px 0" }}>
                                        Chưa có danh mục
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.idDanhMuc} style={{ cursor: "pointer" }}
                                        onClick={() => onNavigate("edit", item)}>
                                        <td>{item.idDanhMuc}</td>
                                        <td><strong>{item.tenDanhMuc}</strong></td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-warning"
                                                onClick={(e) => { e.stopPropagation(); onNavigate("edit", item); }}>
                                                Sửa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {deleteTarget && (
                <DeleteModal
                    item={deleteTarget}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                    deleting={deleting}
                />
            )}
        </div>
    );
}

// --- CreateView ---
function CreateView({ onNavigate }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.tenDanhMuc.trim()) e.tenDanhMuc = "Vui lòng nhập tên danh mục";
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
                        ← Quay lại
                    </button>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Thêm danh mục</h1>
                </div>
                <p style={{ margin: 0, color: "#6b7280" }}>Tạo nhóm sản phẩm mới để quản lý danh mục bán hàng.</p>
            </div>

            <div className="card p-4" style={{ maxWidth: 640 }}>
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                            Tên danh mục <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                            type="text" name="tenDanhMuc"
                            className={`form-control ${errors.tenDanhMuc ? "is-invalid" : ""}`}
                            placeholder="Nhập tên danh mục"
                            value={form.tenDanhMuc}
                            onChange={handleChange}
                        />
                        {errors.tenDanhMuc && <div className="invalid-feedback" style={{ display: "block" }}>{errors.tenDanhMuc}</div>}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Mô tả</label>
                        <textarea
                            name="moTa" className="form-control" rows={4}
                            placeholder="Nhập mô tả danh mục"
                            value={form.moTa} onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => onNavigate("list")}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? "Đang lưu..." : "+ Thêm mới"}
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                // const data = await apiGetOne(selected.idDanhMuc);
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
        if (!form.tenDanhMuc?.trim()) e.tenDanhMuc = "Vui lòng nhập tên danh mục";
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
            // await apiUpdate(form.idDanhMuc, form);
            onNavigate("list");
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            // await apiDelete(form.idDanhMuc);
            onNavigate("list");
        } catch (e) {
            setErrors({ _global: e.message });
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>Đang tải...</div>;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onNavigate("list")}>
                        ← Quay lại
                    </button>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Cập nhật danh mục</h1>
                </div>
                <p style={{ margin: 0, color: "#6b7280" }}>Chỉnh sửa thông tin danh mục sản phẩm.</p>
            </div>

            <div className="card p-4 mb-4" style={{ maxWidth: 640 }}>
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4, color: "#6b7280" }}>
                            Mã danh mục
                        </label>
                        <input type="text" className="form-control" value={form.idDanhMuc || ""} disabled />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                            Tên danh mục <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                            type="text" name="tenDanhMuc"
                            className={`form-control ${errors.tenDanhMuc ? "is-invalid" : ""}`}
                            placeholder="Nhập tên danh mục"
                            value={form.tenDanhMuc || ""}
                            onChange={handleChange}
                        />
                        {errors.tenDanhMuc && <div className="invalid-feedback" style={{ display: "block" }}>{errors.tenDanhMuc}</div>}
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Mô tả</label>
                        <textarea
                            name="moTa" className="form-control" rows={4}
                            placeholder="Nhập mô tả danh mục"
                            value={form.moTa || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" className="btn btn-outline-secondary" onClick={() => onNavigate("list")}>
                            Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? "Đang lưu..." : "💾 Cập nhật"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger zone */}
            <div className="card p-4" style={{ maxWidth: 640, border: "1px solid #fca5a5", background: "#fff5f5" }}>
                <h5 style={{ color: "#dc2626", fontWeight: 700, marginBottom: 6 }}>Xóa danh mục</h5>
                <p style={{ color: "#374151", marginBottom: 16, fontSize: 14 }}>
                    Danh mục sẽ được ẩn khỏi khu vực quản lý. Nên kiểm tra sản phẩm liên quan trước khi xóa.
                </p>
                <button className="btn" style={{ background: "#ef4444", color: "#fff" }}
                    onClick={() => setShowDeleteModal(true)}>
                    🗑 Xóa danh mục
                </button>
            </div>

            {showDeleteModal && (
                <DeleteModal
                    item={form}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    deleting={deleting}
                />
            )}
        </div>
    );
}

// --- MAIN ---
export function Category() {
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
            default: return <ListView onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="container-fluid py-4 px-4">
            {renderView()}
        </div>
    );
}