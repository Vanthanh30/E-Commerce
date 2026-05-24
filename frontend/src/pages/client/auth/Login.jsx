import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { authService } from "../../../services/client/auth.service";
import styles from "./Login.module.css";

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
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
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
      const response = await authService.login({ username, password, rememberDevice });
      loginGlobal(response.user, response.role);
      navigate(response.role === "admin" ? "/admin/products" : "/");
    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className={styles.authLayout}>
      {/* ── Cột trái: Brand ── */}
      <div className={styles.authBrand}>
        <div
          className={styles.authBrandBg}
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')" }}
        />
        <div className={styles.authBrandContent}>
          <span className={styles.authBadge}>THÀNH LẬP 2024</span>
          <h1>The Editorial Atelier</h1>
          <p>
            Một cuộc đối thoại chọn lọc giữa không gian và vật thể. Đăng nhập để
            quản lý bộ sưu tập và điều phối câu chuyện nội thất của bạn.
          </p>
        </div>
        <div className={styles.authStats}>
          <div className={styles.authStat}>
            <strong>4.9</strong>
            <span>Sự hài lòng khách hàng</span>
          </div>
          <div className={styles.authStat}>
            <strong>12k+</strong>
            <span>Tác phẩm tuyển chọn</span>
          </div>
        </div>
      </div>

      {/* ── Cột phải: Form ── */}
      <div className={styles.authPanel}>
        <h2>Chào mừng trở lại</h2>
        <p className={styles.lead}>
          Vui lòng nhập thông tin đăng nhập để truy cập không gian làm việc.
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div className={styles.formGroup}>
            <label htmlFor="username">Tên đăng nhập</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.iconPrefix}><IconUser /></span>
              <input
                type="text"
                id="username"
                name="username"
                className={styles.formControl}
                placeholder="admin@atelieraccord.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">
              Mật khẩu
              <a href="#" className={styles.forgotLink}>Quên mật khẩu?</a>
            </label>
            <div className={styles.inputWithIcon}>
              <span className={styles.iconPrefix}><IconLock /></span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={styles.formControl}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((v) => !v)}
              >
                <IconEye open={showPassword} />
              </button>
            </div>
          </div>

          {/* Remember device */}
          <label className={styles.rememberLabel}>
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            Ghi nhớ thiết bị này
          </label>

          <button type="submit" className={styles.btnPrimary}>
            Đăng nhập
            <IconArrow />
          </button>
        </form>

        <div className={styles.authDivider}>Hoặc truy cập đối tác</div>

        <div className={styles.authSocial}>
          <button type="button" className={styles.btnGhost}>Google</button>
          <button type="button" className={styles.btnGhost}>SSO</button>
        </div>

        <p className={styles.registerLink}>
          Chưa có tài khoản?{" "}
          <Link to="/register">Đăng ký truy cập</Link>
        </p>

        <div className={styles.authFooterLinks}>
          <span>ATELIER ACCORD © {new Date().getFullYear()}</span>
          <a href="#">Quyền riêng tư</a>
          <a href="#">Pháp lý</a>
        </div>
      </div>
    </div>
  );
};