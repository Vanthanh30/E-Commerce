import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/client/authService";
import { assetUrl } from "../../../utils/formatters";
import "./auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword)
      return setError("Mật khẩu xác nhận không khớp!");

    setLoading(true);
    try {
      await authService.register(formData);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Lỗi khi đăng ký tài khoản.");
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
          <span className="auth-badge">THÀNH VIÊN MỚI</span>
          <h1>Tham gia Atelier Accord</h1>
        </div>
      </div>

      <div className="auth-panel-compact">
        <Link to="/" className="back-to-shop-link">
          <i className="material-icons">arrow_back</i> Quay lại cửa hàng
        </Link>
        <h2>Đăng ký tài khoản</h2>
        <p className="lead">Hệ thống tài khoản Atelier độc bản.</p>
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
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ height: "42px", marginTop: "16px" }}
            disabled={loading}
          >
            Tạo tài khoản
          </button>
        </form>
        <p style={{ marginTop: "16px", fontSize: "13px", textAlign: "center" }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
