import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/client/authService";
import { assetUrl } from "../../../utils/formatters";
import "./auth.css";

const USERNAME_PATTERN = /^[A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9_]*$/;
const PHONE_PATTERN = /^0(3|5|7|8|9)\d{8}$/;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phoneNumber" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFormData({ ...formData, [name]: nextValue });
  };

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
            backgroundImage: `url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80')`,
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
        <p
          style={{
            marginTop: "24px",
            fontSize: "13px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--primary)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
