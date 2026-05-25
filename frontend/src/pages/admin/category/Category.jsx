import { useState, useEffect } from "react";
import { Plus, X, ArrowLeft, Save, Trash2 } from "lucide-react";
import "./Category.css";

import { categoryService } from "../../../services/admin/categoryService";

const EMPTY_FORM = { tenDanhMuc: "", moTa: "", trangThai: 1 };

const mapToFrontend = (c) => ({
    idDanhMuc: c.categoryId,
    tenDanhMuc: c.name,
    moTa: c.description || "",
    trangThai: 1
});

async function apiGetAll() {
    const data = await categoryService.getAll();
    return data.map(mapToFrontend);
}
async function apiGetOne(id) {
    // Backend get all and we find it or we can just pass the selected item
    const data = await categoryService.getAll();
    const item = data.find(c => c.categoryId === id);
    if (!item) throw new Error("Không tìm thấy danh mục");
    return mapToFrontend(item);
}
async function apiCreate(data) {
    return categoryService.create({
        name: data.tenDanhMuc,
        description: data.moTa
    });
}
async function apiUpdate(id, data) {
    return categoryService.update(id, {
        name: data.tenDanhMuc,
        description: data.moTa
    });
}
async function apiDelete(id) {
    return categoryService.delete(id);
}

// --- DeleteModal ---
function DeleteModal({ item, onConfirm, onCancel, deleting }) {
    return (
        <div className="cat-modal-overlay">
            <div className="cat-modal">
                <div className="cat-modal-header">
                    <h2>Xác nhận xóa!</h2>
                    <span className="cat-modal-close" onClick={onCancel} style={{ cursor: "pointer" }}><X size={20} /></span>
                </div>
                <div className="cat-modal-body">
                    <p className="cat-modal-warn">
                        Bạn có chắc chắn muốn xóa danh mục <strong>"{item?.tenDanhMuc}"</strong>?
                    </p>
                    <p className="cat-modal-note">
                        Lưu ý: không thể hoàn tác sau khi xác nhận!!
                    </p>
                </div>
                <div className="cat-modal-actions">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={onCancel}
                        disabled={deleting}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={onConfirm}
                        disabled={deleting}
                    >
                        {deleting ? "Đang xóa..." : "Xóa"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- ListView (Index.cshtml) ---
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
            const data = await apiGetAll();
            setItems(data);
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
            await apiDelete(deleteTarget.idDanhMuc);
            setDeleteTarget(null);
            load();
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="cat-wrapper">
            {/* admin-page-header */}
            <div className="cat-page-header">
                <div>
                    <h1>Quản lý danh mục</h1>
                    <p>Tổ chức bộ sưu tập nội thất theo danh mục.</p>
                </div>
                <button className="btn btn-primary" onClick={() => onNavigate("create")} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Plus size={16} /> Thêm danh mục
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="cat-loading">Đang tải...</div>
            ) : (
                /* data-table */
                <div className="cat-table-wrap">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="cat-thead">
                            <tr>
                                <th>Mã danh mục</th>
                                <th>Tên danh mục</th>
                                <th style={{ width: 100 }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="cat-empty">Chưa có danh mục</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr
                                        key={item.idDanhMuc}
                                        className="cat-table-row"
                                        onClick={() => onNavigate("edit", item)}
                                    >
                                        <td>{item.idDanhMuc}</td>
                                        <td>{item.tenDanhMuc}</td>
                                        <td>
                                            <span
                                                className="cat-link-edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onNavigate("edit", item);
                                                }}
                                            >
                                                Sửa
                                            </span>
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

// --- CreateView (Create.cshtml) ---
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
            await apiCreate(form);
            onNavigate("list");
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="cat-wrapper">
            {/* admin-page-header */}
            <div className="cat-page-header">
                <div>
                    <h1>Thêm danh mục</h1>
                    <p>Tạo nhóm sản phẩm mới để quản lý danh mục bán hàng.</p>
                </div>
                <button
                    className="cat-btn-back"
                    onClick={() => onNavigate("list")}
                >
                    ← Quay lại
                </button>
            </div>

            {/* admin-form-card */}
            <div className="cat-form-card">
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}

                <form onSubmit={handleSubmit}>
                    {/* admin-form-grid */}
                    <div className="cat-form-grid">
                        <div className="cat-field cat-field-full">
                            <label>
                                Tên danh mục <span className="req">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenDanhMuc"
                                className={`form-control ${errors.tenDanhMuc ? "is-invalid" : ""}`}
                                placeholder="Nhập tên danh mục"
                                value={form.tenDanhMuc}
                                onChange={handleChange}
                            />
                            {errors.tenDanhMuc && (
                                <div className="invalid-feedback" style={{ display: "block" }}>
                                    {errors.tenDanhMuc}
                                </div>
                            )}
                        </div>

                        <div className="cat-field cat-field-full">
                            <label>Mô tả</label>
                            <textarea
                                name="moTa"
                                className="form-control"
                                rows={4}
                                placeholder="Nhập mô tả danh mục"
                                value={form.moTa}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* admin-form-actions */}
                    <div className="cat-form-actions">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => onNavigate("list")}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            {submitting ? "Đang lưu..." : <><Plus size={16} /> Thêm mới</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- EditView (Edit.cshtml) ---
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
                const data = await apiGetOne(selected.idDanhMuc);
                setForm(data);
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
            await apiUpdate(form.idDanhMuc, form);
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
            await apiDelete(form.idDanhMuc);
            onNavigate("list");
        } catch (e) {
            setErrors({ _global: e.message });
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return <div className="cat-loading">Đang tải...</div>;

    return (
        <div className="cat-wrapper">
            {/* admin-page-header */}
            <div className="cat-page-header">
                <div>
                    <h1>Cập nhật danh mục</h1>
                    <p>Chỉnh sửa thông tin danh mục sản phẩm.</p>
                </div>
                <button
                    className="cat-btn-back"
                    onClick={() => onNavigate("list")}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>
            </div>

            {/* admin-form-card */}
            <div className="cat-form-card">
                {errors._global && <div className="alert alert-danger">{errors._global}</div>}

                <form onSubmit={handleSubmit}>
                    {/* hidden fields equivalent */}
                    <input type="hidden" name="idDanhMuc" value={form.idDanhMuc || ""} />
                    <input type="hidden" name="trangThai" value={form.trangThai ?? 1} />

                    {/* admin-form-grid */}
                    <div className="cat-form-grid">
                        <div className="cat-field">
                            <label className="muted">Mã danh mục</label>
                            <input
                                type="text"
                                className="form-control"
                                value={form.idDanhMuc || ""}
                                disabled
                            />
                        </div>

                        <div className="cat-field">
                            <label>
                                Tên danh mục <span className="req">*</span>
                            </label>
                            <input
                                type="text"
                                name="tenDanhMuc"
                                className={`form-control ${errors.tenDanhMuc ? "is-invalid" : ""}`}
                                placeholder="Nhập tên danh mục"
                                value={form.tenDanhMuc || ""}
                                onChange={handleChange}
                            />
                            {errors.tenDanhMuc && (
                                <div className="invalid-feedback" style={{ display: "block" }}>
                                    {errors.tenDanhMuc}
                                </div>
                            )}
                        </div>

                        <div className="cat-field cat-field-full">
                            <label>Mô tả</label>
                            <textarea
                                name="moTa"
                                className="form-control"
                                rows={4}
                                placeholder="Nhập mô tả danh mục"
                                value={form.moTa || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* admin-form-actions */}
                    <div className="cat-form-actions">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => onNavigate("list")}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            {submitting ? "Đang lưu..." : <><Save size={16} /> Cập nhật</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* admin-danger-panel */}
            <div className="cat-danger-card">
                <h5>Xóa danh mục</h5>
                <p>
                    Danh mục sẽ được ẩn khỏi khu vực quản lý.
                    Nên kiểm tra sản phẩm liên quan trước khi xóa.
                </p>
                <button
                    className="btn btn-danger"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                    <Trash2 size={16} /> Xóa danh mục
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
function Category() {
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
        <div className="container-fluid p-0">
            {renderView()}
        </div>
    );
}

export default Category;