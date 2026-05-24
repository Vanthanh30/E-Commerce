import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { authService } from "../../../services/client/auth.service";

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="11" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const IconEye = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState("");

  const { loginGlobal } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await authService.login({
        username,
        password,
        rememberDevice,
      });
      loginGlobal(response.user, response.role);
      navigate(response.role === "admin" ? "/admin/products" : "/");
    } catch (err) {
      setError(
        err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.",
      );
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div
          className="auth-brand-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')",
          }}
        ></div>
        <div className="auth-brand-content">
          <span className="auth-badge">THÀNH LẬP 2024</span>
          <h1>The Editorial Atelier</h1>
          <p>
            Một cuộc đối thoại chọn lọc giữa không gian và vật thể. Đăng nhập để
            quản lý bộ sưu tập và điều phối câu chuyện nội thất của bạn.
          </p>
        </div>
        <div className="auth-stats">
          <div className="auth-stat">
            <strong>4.9</strong>
            <span>Sự hài lòng khách hàng</span>
          </div>
          <div className="auth-stat">
            <strong>12k+</strong>
            <span>Tác phẩm tuyển chọn</span>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <h2>Chào mừng trở lại</h2>
        <p className="lead">
          Vui lòng nhập thông tin đăng nhập để truy cập không gian làm việc.
        </p>

        {error && (
          <div
            style={{
              color: "var(--danger)",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <div className="input-with-icon">
              <span className="icon-prefix" style={{ display: "flex", alignItems: "center", color: "var(--text-muted, #888)" }}>
                <IconUser />
              </span>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                placeholder="admin@atelieraccord.com"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Mật khẩu{" "}
              <a
                href="#"
                style={{
                  float: "right",
                  fontSize: "11px",
                  color: "var(--primary)",
                }}
              >
                Quên mật khẩu?
              </a>
            </label>
            <div className="input-with-icon">
              <span className="icon-prefix" style={{ display: "flex", alignItems: "center", color: "var(--text-muted, #888)" }}>
                <IconLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((value) => !value)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <IconEye open={showPassword} />
              </button>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
              style={{ width: "auto" }}
            />{" "}
            Ghi nhớ thiết bị này
          </label>

          <button type="submit" className="btn btn-primary btn-block" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            Đăng nhập
            <IconArrow />
          </button>
        </form>

        <div className="auth-divider">Hoặc truy cập đối tác</div>
        <div className="auth-social">
          <button type="button" className="btn btn-ghost">
            Google
          </button>
          <button type="button" className="btn btn-ghost">
            SSO
          </button>
        </div>

        <p
          style={{
            marginTop: "24px",
            fontSize: "14px",
            color: "var(--text-muted)",
          }}
        >
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            Đăng ký truy cập
          </Link>
        </p>

        <div className="auth-footer-links">
          <span>ATELIER ACCORD © {new Date().getFullYear()}</span>
          <a href="#">Quyền riêng tư</a>
          <a href="#">Pháp lý</a>
        </div>
      </div>
    </div>
  );
};