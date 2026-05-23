import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Boxes,
  Check,
  LogOut,
  PackageCheck,
  Search,
  ShoppingCart,
  Store,
  Tags,
  Trash2,
  UserRound
} from "lucide-react";
import { api, assetUrl, currency, dateTime } from "./lib/api";
import "./styles.css";

const orderTabs = [
  { value: "", label: "Tất cả" },
  { value: "1", label: "Chờ xác nhận" },
  { value: "2", label: "Đã xác nhận" },
  { value: "3", label: "Đang giao" },
  { value: "4", label: "Đã giao" },
  { value: "5", label: "Đã hủy" }
];

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem("session") || "null"));
  const [view, setView] = useState(session?.role === "admin" ? "admin-products" : "shop");
  const [notice, setNotice] = useState("");

  function saveSession(next) {
    setSession(next);
    if (next) localStorage.setItem("session", JSON.stringify(next));
    else localStorage.removeItem("session");
    setView(next?.role === "admin" ? "admin-products" : "shop");
  }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setView(session?.role === "admin" ? "admin-products" : "shop")}>
          <Store size={24} />
          <span>Atelier Accord</span>
        </button>
        <nav className="nav">
          {session?.role !== "admin" && (
            <>
              <button className={view === "shop" ? "active" : ""} onClick={() => setView("shop")}>Sản phẩm</button>
              {session && <button className={view === "cart" ? "active" : ""} onClick={() => setView("cart")}>Giỏ hàng</button>}
              {session && <button className={view === "orders" ? "active" : ""} onClick={() => setView("orders")}>Đơn hàng</button>}
              {session && <button className={view === "bargains" ? "active" : ""} onClick={() => setView("bargains")}>Trả giá</button>}
            </>
          )}
          {session?.role === "admin" && (
            <>
              <button className={view === "admin-products" ? "active" : ""} onClick={() => setView("admin-products")}><Boxes size={16} /> Sản phẩm</button>
              <button className={view === "admin-categories" ? "active" : ""} onClick={() => setView("admin-categories")}><Tags size={16} /> Danh mục</button>
              <button className={view === "admin-orders" ? "active" : ""} onClick={() => setView("admin-orders")}><PackageCheck size={16} /> Đơn hàng</button>
              <button className={view === "admin-bargains" ? "active" : ""} onClick={() => setView("admin-bargains")}><Check size={16} /> Mặc cả</button>
              <button className={view === "admin-stats" ? "active" : ""} onClick={() => setView("admin-stats")}><BarChart3 size={16} /> Thống kê</button>
            </>
          )}
        </nav>
        <div className="account">
          {session ? (
            <>
              <span><UserRound size={16} /> {session.user.tenKhachHang || session.user.userName}</span>
              <button className="icon-btn" title="Đăng xuất" onClick={() => saveSession(null)}><LogOut size={18} /></button>
            </>
          ) : (
            <button className="primary" onClick={() => setView("login")}>Đăng nhập</button>
          )}
        </div>
      </header>

      {notice && <div className="notice" onClick={() => setNotice("")}>{notice}</div>}

      <main>
        {!session && view === "login" && <AuthPage onLogin={saveSession} setNotice={setNotice} />}
        {(!session || session.role === "customer") && view === "shop" && <ShopPage session={session} requireLogin={() => setView("login")} setNotice={setNotice} />}
        {session?.role === "customer" && view === "cart" && <CartPage session={session} setNotice={setNotice} />}
        {session?.role === "customer" && view === "orders" && <OrdersPage session={session} setNotice={setNotice} />}
        {session?.role === "customer" && view === "bargains" && <BargainsPage session={session} />}
        {session?.role === "admin" && view === "admin-products" && <AdminProducts setNotice={setNotice} />}
        {session?.role === "admin" && view === "admin-categories" && <AdminCategories setNotice={setNotice} />}
        {session?.role === "admin" && view === "admin-orders" && <AdminOrders setNotice={setNotice} />}
        {session?.role === "admin" && view === "admin-bargains" && <AdminBargains setNotice={setNotice} />}
        {session?.role === "admin" && view === "admin-stats" && <StatsPage />}
      </main>
    </div>
  );
}

function AuthPage({ onLogin, setNotice }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await api.post("/api/auth/login", {
          username: form.username,
          password: form.password
        });
        onLogin(data);
      } else {
        await api.post("/api/auth/register", {
          username: form.username,
          password: form.password,
          confirmPassword: form.confirmPassword,
          email: form.email,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          address: form.address,
          birthDate: form.birthDate
        });
        setNotice("Đăng ký thành công, hãy đăng nhập");
        setMode("login");
      }
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-panel">
      <form className="form surface" onSubmit={submit}>
        <div className="segmented">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Đăng nhập</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Đăng ký</button>
        </div>
        <label>Tên đăng nhập<input required value={form.username || ""} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
        <label>Mật khẩu<input required type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {mode === "register" && (
          <>
            <label>Xác nhận mật khẩu<input required type="password" value={form.confirmPassword || ""} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></label>
            <label>Họ tên<input required value={form.fullName || ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
            <label>Số điện thoại<input required value={form.phoneNumber || ""} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label>
            <label>Email<input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Ngày sinh<input type="date" value={form.birthDate || ""} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
            <label>Địa chỉ<textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          </>
        )}
        <button className="primary" disabled={loading}>{loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
      </form>
    </section>
  );
}

function ShopPage({ session, requireLogin, setNotice }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selected, setSelected] = useState(null);
  const [bargain, setBargain] = useState({});

  async function load() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    setProducts(await api.get(`/api/products?${params}`));
  }

  useEffect(() => {
    api.get("/api/categories").then(setCategories).catch((e) => setNotice(e.message));
  }, []);

  useEffect(() => {
    load().catch((e) => setNotice(e.message));
  }, [categoryId]);

  async function addToCart(product) {
    if (!session) return requireLogin();
    await api.post("/api/cart", { customerId: session.user.idKhachHang, productId: product.idSP, quantity: 1 });
    setNotice("Đã thêm vào giỏ hàng");
  }

  async function submitBargain(product) {
    if (!session) return requireLogin();
    await api.post("/api/bargains", {
      customerId: session.user.idKhachHang,
      productId: product.idSP,
      price: bargain.price,
      quantity: bargain.quantity || 1,
      note: bargain.note,
      soLan: 1
    });
    setNotice("Đã gửi yêu cầu trả giá");
    setBargain({});
  }

  return (
    <section className="content">
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input placeholder="Tìm sản phẩm" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
        </div>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => <option key={c.idDanhMuc} value={c.idDanhMuc}>{c.tenDanhMuc}</option>)}
        </select>
        <button onClick={load}>Lọc</button>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <article className="product" key={product.idSP}>
            <img src={assetUrl(product.hinhAnh)} alt={product.tenSanPham} />
            <div>
              <p className="muted">{product.tenDanhMuc}</p>
              <h3>{product.tenSanPham}</h3>
              <p>{currency(product.giaCoDinh)}</p>
              <p className="muted">Còn {product.SoLuongCon || 0}</p>
            </div>
            <div className="actions">
              <button onClick={() => setSelected(product)}>Chi tiết</button>
              <button className="primary" onClick={() => addToCart(product)}><ShoppingCart size={16} /> Thêm</button>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <article className="dialog" onClick={(e) => e.stopPropagation()}>
            <img className="detail-image" src={assetUrl(selected.hinhAnh)} alt={selected.tenSanPham} />
            <h2>{selected.tenSanPham}</h2>
            <p className="price">{currency(selected.giaCoDinh)}</p>
            <p>{selected.moTa}</p>
            <div className="inline-form">
              <input type="number" placeholder="Giá đề nghị" value={bargain.price || ""} onChange={(e) => setBargain({ ...bargain, price: e.target.value })} />
              <input type="number" min="1" placeholder="SL" value={bargain.quantity || ""} onChange={(e) => setBargain({ ...bargain, quantity: e.target.value })} />
              <input placeholder="Ghi chú" value={bargain.note || ""} onChange={(e) => setBargain({ ...bargain, note: e.target.value })} />
              <button onClick={() => submitBargain(selected)}>Gửi trả giá</button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function CartPage({ session, setNotice }) {
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(session.user.diaChi || "");

  async function load() {
    setItems(await api.get(`/api/cart/${session.user.idKhachHang}`));
  }

  useEffect(() => {
    load().catch((e) => setNotice(e.message));
  }, []);

  async function update(item, quantity) {
    setItems(await api.patch(`/api/cart/${session.user.idKhachHang}/${item.idSP}`, { quantity }));
  }

  async function remove(item) {
    setItems(await api.delete(`/api/cart/${session.user.idKhachHang}/${item.idSP}`));
  }

  async function checkout(item) {
    await api.post("/api/orders", {
      customerId: session.user.idKhachHang,
      productId: item.idSP,
      quantity: item.soLuong,
      price: item.Gia,
      address
    });
    setNotice("Đã đặt hàng");
    await load();
  }

  return (
    <section className="content narrow">
      <div className="surface">
        <h2>Giỏ hàng</h2>
        <label>Địa chỉ nhận hàng<textarea value={address} onChange={(e) => setAddress(e.target.value)} /></label>
        <div className="list">
          {items.map((item) => (
            <article className="row-item" key={item.idSP}>
              <img src={assetUrl(item.hinhAnh)} alt={item.tenSP} />
              <div>
                <h3>{item.tenSP}</h3>
                <p>{currency(item.Gia)} x {item.soLuong} = {currency(item.Tong)}</p>
              </div>
              <input className="qty" type="number" min="1" value={item.soLuong || 1} onChange={(e) => update(item, e.target.value)} />
              <button className="primary" onClick={() => checkout(item)}>Đặt hàng</button>
              <button className="icon-btn danger" title="Xóa" onClick={() => remove(item)}><Trash2 size={18} /></button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OrdersPage({ session, setNotice }) {
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState([]);

  async function load() {
    const params = new URLSearchParams({ customerId: session.user.idKhachHang });
    if (status) params.set("status", status);
    setOrders(await api.get(`/api/orders?${params}`));
  }

  useEffect(() => {
    load().catch((e) => setNotice(e.message));
  }, [status]);

  async function received(order) {
    await api.patch(`/api/orders/${order.idDH}/status`, { status: 4 });
    setNotice("Đã xác nhận nhận hàng");
    await load();
  }

  return <OrderList orders={orders} status={status} setStatus={setStatus} customerActions={received} />;
}

function BargainsPage({ session }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get(`/api/bargains?customerId=${session.user.idKhachHang}&latest=true`).then(setRows);
  }, []);
  return <BargainList rows={rows} />;
}

function AdminProducts({ setNotice }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({});

  async function load() {
    setProducts(await api.get("/api/products?includeInactive=true"));
    setCategories(await api.get("/api/categories"));
  }

  useEffect(() => {
    load().catch((e) => setNotice(e.message));
  }, []);

  async function save(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (form.idSP) await api.put(`/api/products/${form.idSP}`, data);
    else await api.post("/api/products", data);
    setForm({});
    event.currentTarget.reset();
    await load();
  }

  async function remove(product) {
    await api.delete(`/api/products/${product.idSP}`);
    setNotice("Đã ẩn sản phẩm");
    await load();
  }

  return (
    <section className="admin-grid">
      <form className="form surface" onSubmit={save} key={form.idSP || "new-product"}>
        <h2>{form.idSP ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
        <select name="idDanhMuc" defaultValue={form.idDanhMuc || ""} required>
          <option value="">Chọn danh mục</option>
          {categories.map((c) => <option key={c.idDanhMuc} value={c.idDanhMuc}>{c.tenDanhMuc}</option>)}
        </select>
        <input name="tenSanPham" placeholder="Tên sản phẩm" defaultValue={form.tenSanPham || ""} required />
        <input name="giaCoDinh" type="number" placeholder="Giá cố định" defaultValue={form.giaCoDinh || ""} required />
        <input name="giaThapNhat" type="number" placeholder="Giá thấp nhất" defaultValue={form.giaThapNhat || ""} />
        <input name="SoLuongCon" type="number" placeholder="Số lượng" defaultValue={form.SoLuongCon || ""} />
        <input name="image" type="file" accept="image/*" />
        <textarea name="moTa" placeholder="Mô tả" defaultValue={form.moTa || ""} />
        <button className="primary">{form.idSP ? "Lưu" : "Thêm"}</button>
      </form>
      <DataTable rows={products} columns={["idSP", "tenSanPham", "tenDanhMuc", "giaCoDinh", "SoLuongCon", "trangThai"]} onEdit={setForm} onDelete={remove} />
    </section>
  );
}

function AdminCategories({ setNotice }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  async function load() {
    setRows(await api.get("/api/categories?includeInactive=true"));
  }
  useEffect(() => {
    load().catch((e) => setNotice(e.message));
  }, []);
  async function save(event) {
    event.preventDefault();
    if (form.idDanhMuc) await api.put(`/api/categories/${form.idDanhMuc}`, form);
    else await api.post("/api/categories", form);
    setForm({});
    await load();
  }
  async function remove(row) {
    await api.delete(`/api/categories/${row.idDanhMuc}`);
    await load();
  }
  return (
    <section className="admin-grid">
      <form className="form surface" onSubmit={save}>
        <h2>{form.idDanhMuc ? "Sửa danh mục" : "Thêm danh mục"}</h2>
        <input placeholder="Tên danh mục" value={form.tenDanhMuc || ""} onChange={(e) => setForm({ ...form, tenDanhMuc: e.target.value })} required />
        <textarea placeholder="Mô tả" value={form.moTa || ""} onChange={(e) => setForm({ ...form, moTa: e.target.value })} />
        <button className="primary">Lưu</button>
      </form>
      <DataTable rows={rows} columns={["idDanhMuc", "tenDanhMuc", "moTa", "trangThai"]} onEdit={setForm} onDelete={remove} />
    </section>
  );
}

function AdminOrders({ setNotice }) {
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState([]);
  async function load() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    setOrders(await api.get(`/api/orders?${params}`));
  }
  useEffect(() => {
    load().catch((e) => setNotice(e.message));
  }, [status]);
  async function setOrderStatus(order, next) {
    await api.patch(`/api/orders/${order.idDH}/status`, { status: next });
    await load();
  }
  return <OrderList orders={orders} status={status} setStatus={setStatus} adminActions={setOrderStatus} />;
}

function AdminBargains({ setNotice }) {
  const [rows, setRows] = useState([]);
  const [counter, setCounter] = useState({});
  async function load() {
    setRows(await api.get("/api/bargains?admin=true"));
  }
  useEffect(() => {
    load().catch((e) => setNotice(e.message));
  }, []);
  async function respond(row, action) {
    await api.post(`/api/bargains/${row.IdTraGia}/respond`, {
      action,
      soLan: row.SoLan,
      price: counter.price || row.GiaDeNghi,
      quantity: counter.quantity || row.SoLuong,
      note: counter.note || row.GhiChu
    });
    setCounter({});
    await load();
  }
  return (
    <section className="content">
      <div className="list">
        {rows.map((row) => (
          <article className="row-item tall" key={`${row.IdTraGia}-${row.SoLan}`}>
            <img src={assetUrl(row.hinhanh)} alt={row.TenSP} />
            <div>
              <h3>{row.TenSP}</h3>
              <p>{row.IdKhach} - {row.tenKhachHang}</p>
              <p>{currency(row.GiaDeNghi)} / SL {row.SoLuong}</p>
              <p className="pill">{row.TrangThai}</p>
            </div>
            <div className="mini-form">
              <input type="number" placeholder="Giá phản hồi" value={counter.price || ""} onChange={(e) => setCounter({ ...counter, price: e.target.value })} />
              <input placeholder="Ghi chú" value={counter.note || ""} onChange={(e) => setCounter({ ...counter, note: e.target.value })} />
              <button onClick={() => respond(row, "counter")}>Đề xuất</button>
              <button className="primary" onClick={() => respond(row, "accept")}>Chấp nhận</button>
              <button className="danger" onClick={() => respond(row, "reject")}>Từ chối</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState([]);
  useEffect(() => {
    api.get(`/api/stats/orders-by-month?year=${year}`).then(setOrders);
    api.get(`/api/stats/revenue-by-month?year=${year}`).then(setRevenue);
  }, [year]);
  const maxOrder = Math.max(1, ...orders.map((i) => i.SoLuongDon));
  const maxRevenue = Math.max(1, ...revenue.map((i) => Number(i.TongDoanhThu || 0)));
  return (
    <section className="content">
      <div className="toolbar"><input type="number" value={year} onChange={(e) => setYear(e.target.value)} /></div>
      <div className="stats-grid">
        <Chart title="Số lượng đơn" rows={orders} valueKey="SoLuongDon" max={maxOrder} formatter={(v) => v} />
        <Chart title="Doanh thu" rows={revenue} valueKey="TongDoanhThu" max={maxRevenue} formatter={currency} />
      </div>
    </section>
  );
}

function Chart({ title, rows, valueKey, max, formatter }) {
  return (
    <div className="surface chart">
      <h2>{title}</h2>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
        const row = rows.find((r) => Number(r.Thang) === month);
        const value = Number(row?.[valueKey] || 0);
        return (
          <div className="bar-row" key={month}>
            <span>T{month}</span>
            <div><i style={{ width: `${Math.max(2, (value / max) * 100)}%` }} /></div>
            <strong>{formatter(value)}</strong>
          </div>
        );
      })}
    </div>
  );
}

function OrderList({ orders, status, setStatus, adminActions, customerActions }) {
  return (
    <section className="content">
      <div className="segmented wide">
        {orderTabs.map((tab) => <button key={tab.value} className={status === tab.value ? "active" : ""} onClick={() => setStatus(tab.value)}>{tab.label}</button>)}
      </div>
      <div className="list">
        {orders.map((order) => (
          <article className="row-item" key={`${order.idDH}-${order.idSP}`}>
            <img src={assetUrl(order.hinh)} alt={order.tensp} />
            <div>
              <h3>{order.tensp}</h3>
              <p>{order.idDH} - {dateTime(order.ngayBan)}</p>
              <p>{currency(order.gia)} x {order.sl}</p>
            </div>
            <span className="pill">{order.trangThaiText}</span>
            {customerActions && order.trangThaiDon === 3 && <button className="primary" onClick={() => customerActions(order)}>Đã nhận</button>}
            {adminActions && (
              <select value={order.trangThaiDon || ""} onChange={(e) => adminActions(order, Number(e.target.value))}>
                {orderTabs.slice(1).map((tab) => <option key={tab.value} value={tab.value}>{tab.label}</option>)}
              </select>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function BargainList({ rows }) {
  return (
    <section className="content">
      <div className="list">
        {rows.map((row) => (
          <article className="row-item" key={`${row.IdTraGia}-${row.SoLan}`}>
            <img src={assetUrl(row.hinhanh)} alt={row.TenSP} />
            <div>
              <h3>{row.TenSP}</h3>
              <p>{currency(row.GiaDeNghi)} x {row.SoLuong}</p>
              <p>{dateTime(row.thoigian)}</p>
            </div>
            <span className="pill">{row.TrangThai}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function DataTable({ rows, columns, onEdit, onDelete }) {
  return (
    <div className="surface table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}<th /></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.idSP || row.idDanhMuc}>
              {columns.map((column) => <td key={column}>{column.toLowerCase().includes("gia") ? currency(row[column]) : String(row[column] ?? "")}</td>)}
              <td className="table-actions">
                <button onClick={() => onEdit(row)}>Sửa</button>
                <button className="danger" onClick={() => onDelete(row)}>Ẩn</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
