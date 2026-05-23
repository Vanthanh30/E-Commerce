// src/pages/client/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/client/auth.service";
import { useAuth } from "../../context/AuthContext";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { loginGlobal } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await authService.login({ username, password });
      // Lưu thông tin vào Context toàn cục
      loginGlobal(response.user, response.role);

      // Điều hướng dựa trên quyền hạn trả về
      if (response.role === "admin") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-brand">
        <div
          className="auth-brand-bg"
          style={{ backgroundImage: "url('/images/auth-hero.png')" }}
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
              <input
                type="text"
                id="username"
                className="form-control"
                placeholder="admin hoặc customer01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <i className="material-icons">
                  {showPassword ? "visibility_off" : "visibility"}
                </i>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Đăng nhập
          </button>
        </form>

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
            style={{ color: "var(--primary)", fontWeight: "600" }}
          >
            Đăng ký truy cập
          </Link>
        </p>
      </div>
    </div>
  );
};
