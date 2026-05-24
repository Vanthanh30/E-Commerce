import React, { useState, useEffect } from "react";
import "./AdminProductList.css";

const BASE_URL = "/api/sanPham";

async function apiGetAll() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Không thể tải danh sách");
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

const EMPTY_FORM = { tenSanPham: "", moTa: "", gia: "", soLuong: "", idDanhMuc: "" };

// --- CreateView ---
function CreateView({ onBack }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.tenSanPham.trim()) e.tenSanPham = "Vui lòng nhập tên sản phẩm";
    if (!form.gia) e.gia = "Vui lòng nhập giá";
    if (!form.soLuong) e.soLuong = "Vui lòng nhập số lượng";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      // await apiCreate(form);
      onBack();
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { label: "Tên sản phẩm", name: "tenSanPham", type: "text", required: true },
    { label: "Giá (VNĐ)", name: "gia", type: "number", required: true },
    { label: "Số lượng", name: "soLuong", type: "number", required: true },
    { label: "ID danh mục", name: "idDanhMuc", type: "text", required: false },
  ];

  return (
    <div className="pl-wrapper">
      <div className="pl-sub-header">
        <div className="pl-sub-header-row">
          <h1>Thêm sản phẩm</h1>
          <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
            ← Quay lại
          </button>
        </div>
        <p>Thêm sản phẩm mới vào hệ thống.</p>
      </div>

      <div className="pl-form-card">
        {errors._global && <div className="alert alert-danger">{errors._global}</div>}

        <form onSubmit={handleSubmit}>
          <div className="pl-form-grid">
            {fields.map(({ label, name, type, required }) => (
              <div key={name} className="pl-field">
                <label>
                  {label} {required && <span className="req">*</span>}
                </label>
                <input
                  type={type} name={name}
                  className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                  value={form[name]}
                  onChange={handleChange}
                />
                {errors[name] && <div className="invalid-feedback" style={{ display: "block" }}>{errors[name]}</div>}
              </div>
            ))}

            <div className="pl-field pl-field-full">
              <label>Mô tả</label>
              <textarea
                name="moTa" className="form-control" rows={4}
                placeholder="Nhập mô tả sản phẩm"
                value={form.moTa} onChange={handleChange}
              />
            </div>
          </div>

          <div className="pl-form-actions">
            <button type="button" className="btn btn-outline-secondary" onClick={onBack}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Đang lưu..." : "+ Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- ListView ---
function ListView({ onCreate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // const data = await apiGetAll();
        // setProducts(data);
        setProducts([]);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="pl-wrapper">
      <div className="pl-page-header">
        <div>
          <h1>Quản lý Sản phẩm</h1>
          <p>Quản lý toàn bộ sản phẩm trong hệ thống.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreate}>
          + Thêm sản phẩm
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="pl-loading">Đang tải...</div>
      ) : (
        <div className="pl-table-wrap">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="pl-empty">Chưa có sản phẩm</td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.productId} style={{ cursor: "pointer" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                        />
                        <div>
                          <strong>{item.name}</strong>
                          <small style={{ display: "block", color: "#6b7280" }}>SKU: {item.productId}</small>
                        </div>
                      </div>
                    </td>
                    <td>{item.categoryName}</td>
                    <td>{Number(item.fixedPrice).toLocaleString("vi-VN")} đ</td>
                    <td>{item.stock}</td>
                    <td>
                      {item.stock > 0
                        ? <span className="badge bg-success">Còn hàng</span>
                        : <span className="badge bg-secondary">Hết hàng</span>
                      }
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

// --- MAIN ---
export const AdminProductList = () => {
  const [view, setView] = useState("list");

  return (
    <div className="container-fluid p-0">
      {view === "create"
        ? <CreateView onBack={() => setView("list")} />
        : <ListView onCreate={() => setView("create")} />
      }
    </div>
  );
};