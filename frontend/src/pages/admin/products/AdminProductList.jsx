import React, { useState, useEffect, useRef } from "react";
import { Plus, ArrowLeft, Save, Trash2, Edit } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdminProductList.css";

import { productService } from "../../../services/admin/productService";
import { categoryService } from "../../../services/admin/categoryService";

const DEFAULT_IMG =
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=240";

const mapToFrontend = (p) => ({
    idSP: p.productId,
    tenSanPham: p.name,
    idDanhMuc: p.categoryId,
    tenDanhMuc: p.categoryName,
    giaCoDinh: p.fixedPrice,
    giaThapNhat: p.minPrice,
    SoLuongCon: p.stock,
    moTa: p.description,
    hinhAnh: p.imageUrl,
    trangThai: p.status,
});

async function apiGetAll() {
    const data = await productService.getAll();
    return data.map(mapToFrontend);
}
async function apiGetOne(id) {
    const data = await productService.getById(id);
    return mapToFrontend(data);
}
async function apiCreate(formData) {
    return productService.create(formData);
}
async function apiUpdate(id, formData) {
    return productService.update(id, formData);
}
async function apiDelete(id) {
    return productService.delete(id);
}
async function apiGetDanhMuc() {
    const data = await categoryService.getAll();
    return data.map(c => ({
        idDanhMuc: c.categoryId,
        tenDanhMuc: c.name
    }));
}

const fmt = (v) =>
    v != null ? Number(v).toLocaleString("vi-VN") + " VNĐ" : "—";

const FILTER_TABS = ["Tất cả", "Đang bán", "Hết hàng", "Lưu nháp"];

/* ════════════════════════════════════════════════════════════
   ListView
   ════════════════════════════════════════════════════════════ */
function ListView({ onCreate, onEdit, onDetails }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("Tất cả");

    useEffect(() => {
        (async () => {
            try {
                const data = await apiGetAll();
                setProducts(data.filter(p => p.trangThai === 1));
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = products.filter((p) => {
        if (activeTab === "Đang bán") return (p.SoLuongCon ?? 0) > 0;
        if (activeTab === "Hết hàng") return (p.SoLuongCon ?? 0) === 0;
        return true;
    });

    const totalValue = filtered.reduce(
        (s, p) => s + Number(p.giaCoDinh || 0),
        0
    );

    return (
        <div className="pl-wrapper">
            <div className="pl-page-header">
                <div>
                    <h1>Quản lý Sản phẩm</h1>
                    <p>Tiếp cận và điều chỉnh danh mục nội thất cao cấp của Atelier Accord.</p>
                </div>
                <button className="btn btn-primary" onClick={onCreate} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Plus size={16} /> Thêm sản phẩm mới
                </button>
            </div>

            {error && <div className="pl-alert pl-alert-danger">{error}</div>}

            <div className="pl-filter-tabs">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`pl-filter-tab${activeTab === tab ? " active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="pl-loading">Đang tải...</div>
            ) : (
                <div className="pl-table-wrap">
                    <table className="pl-data-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá cố định</th>
                                <th>Giá sàn</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="pl-empty">Chưa có sản phẩm</td>
                                </tr>
                            ) : (
                                filtered.map((item) => {
                                    const stock = item.SoLuongCon ?? 0;
                                    const imgUrl = item.hinhAnh
                                        ? item.hinhAnh.startsWith("http")
                                            ? item.hinhAnh
                                            : `/Uploads/${item.hinhAnh}`
                                        : DEFAULT_IMG;
                                    return (
                                        <tr key={item.idSP} className="pl-row" onClick={() => onEdit(item.idSP)}>
                                            <td>
                                                <div className="pl-table-product">
                                                    <img src={imgUrl} alt={item.tenSanPham} />
                                                    <div>
                                                        <strong>{item.tenSanPham}</strong>
                                                        <small>SKU: {item.idSP}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.idDanhMuc ?? "—"}</td>
                                            <td>{fmt(item.giaCoDinh)}</td>
                                            <td>{fmt(item.giaThapNhat)}</td>
                                            <td>{stock}</td>
                                            <td>
                                                {stock > 0 ? (
                                                    <span className="pl-pill in-stock">Còn hàng</span>
                                                ) : (
                                                    <span className="pl-pill out-stock">Hết hàng</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="pl-link-btn"
                                                    onClick={(e) => { e.stopPropagation(); onEdit(item.idSP); }}
                                                >
                                                    Sửa
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="pl-count">Hiển thị {filtered.length} sản phẩm</p>

            <div className="pl-stats">
                <div className="pl-stat-card">
                    <label>Giá trị kho hàng</label>
                    <strong>{totalValue > 0 ? fmt(totalValue) : "—"}</strong>
                </div>
                <div className="pl-stat-card">
                    <label>Thương lượng đang mở</label>
                    <strong>—</strong>
                </div>
                <div className="pl-stat-card featured">
                    <label>Sản phẩm nổi bật</label>
                    <strong>Atelier Collection</strong>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   Shared
   ════════════════════════════════════════════════════════════ */
const EMPTY_FORM = {
    tenSanPham: "", idDanhMuc: "", giaCoDinh: "",
    giaThapNhat: "", SoLuongCon: "", moTa: "", hinhAnh: "",
};

function useCategories() {
    const [list, setList] = useState([]);
    useEffect(() => {
        apiGetDanhMuc().then(setList).catch(() => { });
    }, []);
    return list;
}

/* ════════════════════════════════════════════════════════════
   CreateView
   ════════════════════════════════════════════════════════════ */
function CreateView({ onBack }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const categories = useCategories();
    const fileRef = useRef();

    const validate = () => {
        const e = {};
        if (!form.tenSanPham.trim()) e.tenSanPham = "Vui lòng nhập tên sản phẩm";
        if (!form.giaCoDinh) e.giaCoDinh = "Vui lòng nhập giá cố định";
        if (!form.SoLuongCon) e.SoLuongCon = "Vui lòng nhập số lượng";
        if (!form.idDanhMuc) e.idDanhMuc = "Vui lòng chọn danh mục";
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", form.tenSanPham);
            fd.append("categoryId", form.idDanhMuc);
            fd.append("fixedPrice", form.giaCoDinh);
            fd.append("minPrice", form.giaThapNhat || 0);
            fd.append("stock", form.SoLuongCon);
            fd.append("description", form.moTa || "");
            if (imageFile) fd.append("image", imageFile);
            await apiCreate(fd);
            onBack();
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pl-wrapper">
            <div className="pl-sub-header">
                <div className="pl-sub-header-row">
                    <h1>Thêm sản phẩm</h1>
                    <button className="btn btn-outline" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                </div>
                <p>Tạo sản phẩm mới trong danh mục hiện có.</p>
            </div>

            <div className="pl-form-card">
                {errors._global && <div className="pl-alert pl-alert-danger">{errors._global}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="pl-form-grid">
                        <div className="pl-field">
                            <label>Tên sản phẩm <span className="req">*</span></label>
                            <input type="text" name="tenSanPham" placeholder="Nhập tên sản phẩm"
                                className={errors.tenSanPham ? "is-invalid" : ""}
                                value={form.tenSanPham} onChange={handleChange} />
                            {errors.tenSanPham && <div className="invalid-feedback">{errors.tenSanPham}</div>}
                        </div>
                        <div className="pl-field">
                            <label>Danh mục <span className="req">*</span></label>
                            <select name="idDanhMuc" className={errors.idDanhMuc ? "is-invalid" : ""}
                                value={form.idDanhMuc} onChange={handleChange}>
                                <option value="">Chọn danh mục</option>
                                {categories.map((c) => (
                                    <option key={c.idDanhMuc} value={c.idDanhMuc}>{c.tenDanhMuc}</option>
                                ))}
                            </select>
                            {errors.idDanhMuc && <div className="invalid-feedback">{errors.idDanhMuc}</div>}
                        </div>
                        <div className="pl-field">
                            <label>Giá cố định <span className="req">*</span></label>
                            <input type="number" name="giaCoDinh" min="0" step="1000" placeholder="0"
                                className={errors.giaCoDinh ? "is-invalid" : ""}
                                value={form.giaCoDinh} onChange={handleChange} />
                            {errors.giaCoDinh && <div className="invalid-feedback">{errors.giaCoDinh}</div>}
                        </div>
                        <div className="pl-field">
                            <label>Giá thấp nhất</label>
                            <input type="number" name="giaThapNhat" min="0" step="1000" placeholder="0"
                                value={form.giaThapNhat} onChange={handleChange} />
                        </div>
                        <div className="pl-field">
                            <label>Số lượng còn <span className="req">*</span></label>
                            <input type="number" name="SoLuongCon" min="0" step="1" placeholder="0"
                                className={errors.SoLuongCon ? "is-invalid" : ""}
                                value={form.SoLuongCon} onChange={handleChange} />
                            {errors.SoLuongCon && <div className="invalid-feedback">{errors.SoLuongCon}</div>}
                        </div>
                        <div className="pl-field">
                            <label>Hình ảnh</label>
                            {preview && <img src={preview} alt="preview" className="pl-img-preview" />}
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
                        </div>
                        <div className="pl-field pl-field-full">
                            <label>Mô tả</label>
                            <textarea name="moTa" rows={4} placeholder="Nhập mô tả sản phẩm"
                                value={form.moTa} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="pl-form-actions">
                        <button type="button" className="btn btn-ghost" onClick={onBack}>Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {submitting ? "Đang lưu..." : <><Plus size={16} /> Thêm mới</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   EditView
   ════════════════════════════════════════════════════════════ */
function EditView({ productId, onBack }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [originalImg, setOriginalImg] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const categories = useCategories();
    const fileRef = useRef();

    useEffect(() => {
        (async () => {
            try {
                const data = await apiGetOne(productId);
                setForm({ ...data });
                setOriginalImg(data.hinhAnh || "");
            } catch (e) {
                setErrors({ _global: e.message });
            } finally {
                setLoading(false);
            }
        })();
    }, [productId]);

    const validate = () => {
        const e = {};
        if (!form.tenSanPham?.trim()) e.tenSanPham = "Vui lòng nhập tên sản phẩm";
        if (!form.giaCoDinh) e.giaCoDinh = "Vui lòng nhập giá cố định";
        if (!form.SoLuongCon && form.SoLuongCon !== 0) e.SoLuongCon = "Vui lòng nhập số lượng";
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        setErrors((p) => ({ ...p, [name]: undefined }));
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", form.tenSanPham || "");
            fd.append("categoryId", form.idDanhMuc || "");
            fd.append("fixedPrice", form.giaCoDinh || 0);
            fd.append("minPrice", form.giaThapNhat || 0);
            fd.append("stock", form.SoLuongCon || 0);
            fd.append("description", form.moTa || "");
            if (originalImg) fd.append("imageUrl", originalImg);
            if (imageFile) fd.append("image", imageFile);
            await apiUpdate(productId, fd);
            onBack();
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await apiDelete(productId);
            onBack();
        } catch (err) {
            setErrors({ _global: err.message });
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) return <div className="pl-wrapper"><div className="pl-loading">Đang tải...</div></div>;

    const imgSrc = preview || (originalImg
        ? (originalImg.startsWith("http") ? originalImg : `/Uploads/${originalImg}`)
        : DEFAULT_IMG);

    return (
        <div className="pl-wrapper">
            <div className="pl-sub-header">
                <div className="pl-sub-header-row">
                    <h1>Cập nhật sản phẩm</h1>
                    <button className="btn btn-outline" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                </div>
                <p>Chỉnh sửa thông tin, giá bán và tồn kho của sản phẩm.</p>
            </div>

            <div className="pl-form-card">
                {errors._global && <div className="pl-alert pl-alert-danger">{errors._global}</div>}
                <form onSubmit={handleUpdate}>
                    <div className="pl-form-grid">
                        <div className="pl-field">
                            <label>Mã sản phẩm</label>
                            <input type="text" value={form.idSP ?? ""} disabled />
                        </div>
                        <div className="pl-field">
                            <label>Tên sản phẩm <span className="req">*</span></label>
                            <input type="text" name="tenSanPham" placeholder="Nhập tên sản phẩm"
                                className={errors.tenSanPham ? "is-invalid" : ""}
                                value={form.tenSanPham ?? ""} onChange={handleChange} />
                            {errors.tenSanPham && <div className="invalid-feedback">{errors.tenSanPham}</div>}
                        </div>
                        <div className="pl-field">
                            <label>Danh mục</label>
                            <select name="idDanhMuc" value={form.idDanhMuc ?? ""} onChange={handleChange}>
                                <option value="">Chọn danh mục</option>
                                {categories.map((c) => (
                                    <option key={c.idDanhMuc} value={c.idDanhMuc}>{c.tenDanhMuc}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pl-field">
                            <label>Số lượng còn <span className="req">*</span></label>
                            <input type="number" name="SoLuongCon" min="0" step="1" placeholder="0"
                                className={errors.SoLuongCon ? "is-invalid" : ""}
                                value={form.SoLuongCon ?? ""} onChange={handleChange} />
                            {errors.SoLuongCon && <div className="invalid-feedback">{errors.SoLuongCon}</div>}
                        </div>
                        <div className="pl-field">
                            <label>Giá cố định <span className="req">*</span></label>
                            <input type="number" name="giaCoDinh" min="0" step="1000" placeholder="0"
                                className={errors.giaCoDinh ? "is-invalid" : ""}
                                value={form.giaCoDinh ?? ""} onChange={handleChange} />
                            {errors.giaCoDinh && <div className="invalid-feedback">{errors.giaCoDinh}</div>}
                        </div>
                        <div className="pl-field">
                            <label>Giá thấp nhất</label>
                            <input type="number" name="giaThapNhat" min="0" step="1000" placeholder="0"
                                value={form.giaThapNhat ?? ""} onChange={handleChange} />
                        </div>
                        <div className="pl-field pl-field-full">
                            <label>Mô tả</label>
                            <textarea name="moTa" rows={4} placeholder="Nhập mô tả sản phẩm"
                                value={form.moTa ?? ""} onChange={handleChange} />
                        </div>
                        <div className="pl-field pl-field-full">
                            <label>Hình ảnh</label>
                            <img src={imgSrc} alt={form.tenSanPham} className="pl-img-preview" />
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
                        </div>
                    </div>
                    <div className="pl-form-actions">
                        <button type="button" className="btn btn-ghost" onClick={onBack}>Hủy</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {submitting ? "Đang lưu..." : <><Save size={16} /> Cập nhật</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="pl-danger-panel">
                <h2>Xoá sản phẩm</h2>
                <p>Sản phẩm sẽ được ẩn khỏi danh sách bán hàng nhưng dữ liệu liên quan vẫn được giữ lại.</p>
                {!showDeleteConfirm ? (
                    <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}
                        style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Trash2 size={16} /> Xoá sản phẩm
                    </button>
                ) : (
                    <div className="pl-confirm-delete">
                        <span>Bạn có chắc chắn muốn xoá?</span>
                        <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Đang xoá..." : "Xác nhận xoá"}
                        </button>
                        <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Huỷ</button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   DetailsView
   ════════════════════════════════════════════════════════════ */
function DetailsView({ productId, onBack, onEdit }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiGetOne(productId);
                setProduct(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [productId]);

    if (loading) return <div className="pl-wrapper"><div className="pl-loading">Đang tải...</div></div>;

    const imgSrc = product?.hinhAnh
        ? (product.hinhAnh.startsWith("http") ? product.hinhAnh : `/Uploads/${product.hinhAnh}`)
        : DEFAULT_IMG;

    const rows = product ? [
        { label: "Tên sản phẩm", value: product.tenSanPham },
        { label: "Danh mục", value: product.danhMuc?.tenDanhMuc ?? product.idDanhMuc ?? "—" },
        { label: "Giá cố định", value: fmt(product.giaCoDinh) },
        { label: "Giá thấp nhất", value: fmt(product.giaThapNhat) },
        { label: "Số lượng còn", value: product.SoLuongCon ?? 0 },
        { label: "Mô tả", value: product.moTa || "—" },
        { label: "Trạng thái", value: product.trangThai === 1 ? "Đang bán" : "Lưu nháp" },
    ] : [];

    return (
        <div className="pl-wrapper">
            <div className="pl-sub-header">
                <div className="pl-sub-header-row">
                    <h1>Chi tiết sản phẩm</h1>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-outline" onClick={onBack}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <ArrowLeft size={16} /> Quay lại
                        </button>
                        {product && (
                            <button className="btn btn-primary" onClick={() => onEdit(productId)}
                                style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Edit size={16} /> Sửa
                            </button>
                        )}
                    </div>
                </div>
                <p>Xem thông tin chi tiết của sản phẩm.</p>
            </div>

            {error && <div className="pl-alert pl-alert-danger">{error}</div>}

            {!product ? (
                <div className="pl-empty" style={{ padding: "3rem 0" }}>Không tìm thấy sản phẩm</div>
            ) : (
                <div className="pl-details-card">
                    <div className="pl-details-img-wrap">
                        <img src={imgSrc} alt={product.tenSanPham} className="pl-details-img" />
                    </div>
                    <dl className="pl-details-list">
                        {rows.map(({ label, value }) => (
                            <React.Fragment key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </React.Fragment>
                        ))}
                    </dl>
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   MAIN — AdminProductList
   ════════════════════════════════════════════════════════════ */
const AdminProductList = () => {
    const [view, setView] = useState("list");
    const [selectedId, setSelectedId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Đọc ?edit=SP001 từ URL — do SearchBar navigate sang
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const editId = params.get("edit");
        if (editId) {
            setSelectedId(editId);
            setView("edit");
            // Xóa query param khỏi URL sau khi đọc xong
            navigate("/admin/products", { replace: true });
        }
    }, [location.search]);

    const goList = () => { setView("list"); setSelectedId(null); };
    const goCreate = () => { setView("create"); setSelectedId(null); };
    const goEdit = (id) => { setView("edit"); setSelectedId(id); };
    const goDetails = (id) => { setView("details"); setSelectedId(id); };

    return (
        <div className="container-fluid p-0">
            {view === "list" && <ListView onCreate={goCreate} onEdit={goEdit} onDetails={goDetails} />}
            {view === "create" && <CreateView onBack={goList} />}
            {view === "edit" && <EditView productId={selectedId} onBack={goList} />}
            {view === "details" && <DetailsView productId={selectedId} onBack={goList} onEdit={goEdit} />}
        </div>
    );
};

export default AdminProductList;