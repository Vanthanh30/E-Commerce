import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/client/authService";
import { assetUrl } from "../../../utils/formatters";
import "./auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authService.login(formData);
      if (response && response.user) {
        sessionStorage.setItem("user", JSON.stringify(response.user));
        sessionStorage.setItem("role", response.role);
        navigate(response.role === "admin" ? "/admin/dashboard" : "/");
      }
    } catch (err) {
      setError(err.message || "Tài khoản hoặc mật khẩu không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-fullscreen auth-layout">
      <div className="auth-brand">
        <div
          className="auth-brand-bg"
          style={{
            backgroundImage: `url(${assetUrl("/images/auth-hero.png")})`,
          }}
        ></div>
        <div className="auth-brand-content">
          <span className="auth-badge">THÀNH LẬP 2024</span>
          <h1>The Editorial Atelier</h1>
        </div>
      </div>

      <div className="auth-panel-compact">
        <Link to="/" className="back-to-shop-link">
          <i className="material-icons">arrow_back</i> Quay lại cửa hàng
        </Link>
        <h2>Chào mừng trở lại</h2>
        <p className="lead">Vui lòng nhập thông tin đăng nhập hệ thống.</p>
        {error && (
          <div
            className="alert-danger"
            style={{
              color: "var(--danger)",
              marginBottom: "12px",
              padding: "10px",
              background: "#FFEBEE",
              borderRadius: "6px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="password-input-wrapper">
              <i className="material-icons prefix-icon">lock_outline</i>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className="material-icons" style={{ fontSize: "20px" }}>
                  {showPassword ? "visibility_off" : "visibility"}
                </i>
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ height: "42px", marginTop: "16px" }}
            disabled={loading}
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
