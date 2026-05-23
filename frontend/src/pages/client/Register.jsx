// src/pages/client/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/client/auth.service";

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await authService.register(formData);
      alert("Đăng ký tài khoản Atelier Accord thành công!");
      navigate("/login");
    } catch (err) {
      setError(
        err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
      );
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
          <span className="auth-badge">THÀNH VIÊN MỚI</span>
          <h1>Tham gia Atelier Accord</h1>
          <p>
            Đăng ký để trải nghiệm mua sắm, thương lượng giá và quản lý đơn hàng
            trong không gian nội thất cao cấp.
          </p>
        </div>
      </div>

      <div
        className="auth-panel"
        style={{ maxWidth: "640px", overflowY: "auto" }}
      >
        <h2>Đăng ký tài khoản</h2>
        <p className="lead">
          Trở thành thành viên để trải nghiệm mua sắm tốt nhất.
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

        <form onSubmit={handleRegister}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
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
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
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
          </div>

          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label>Số điện thoại (ID)</label>
              <input
                type="text"
                name="phoneNumber"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="birthDate"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Tạo tài khoản
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            fontSize: "14px",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            style={{ color: "var(--primary)", fontWeight: "600" }}
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};
