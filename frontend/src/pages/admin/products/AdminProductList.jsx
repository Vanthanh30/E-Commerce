import React, { useState, useEffect } from "react";

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
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
            ← Quay lại
          </button>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Thêm sản phẩm</h1>
        </div>
        <p style={{ margin: 0, color: "#6b7280" }}>Thêm sản phẩm mới vào hệ thống.</p>
      </div>

      <div className="card p-4" style={{ maxWidth: 640 }}>
        {errors._global && <div className="alert alert-danger">{errors._global}</div>}

        <form onSubmit={handleSubmit}>
          {fields.map(({ label, name, type, required }) => (
            <div key={name} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
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

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Mô tả</label>
            <textarea
              name="moTa" className="form-control" rows={4}
              placeholder="Nhập mô tả sản phẩm"
              value={form.moTa} onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: 700 }}>Quản lý Sản phẩm</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>Quản lý toàn bộ sản phẩm trong hệ thống.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreate}>
          + Thêm sản phẩm
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
                  <td colSpan={5} style={{ textAlign: "center", color: "#6b7280", padding: "32px 0" }}>
                    Chưa có sản phẩm
                  </td>
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
    <div className="container-fluid py-4 px-4">
      {view === "create"
        ? <CreateView onBack={() => setView("list")} />
        : <ListView onCreate={() => setView("create")} />
      }
    </div>
  );
};