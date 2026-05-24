import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/client/auth.service";

const initialFormData = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  phoneNumber: "",
  birthDate: "",
  address: "",
};

const twoColGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

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
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80')",
          }}
        ></div>
        <div className="auth-brand-content">
          <span className="auth-badge">THÀNH VIÊN MỚI</span>
          <h1>Tham gia Atelier Accord</h1>
          <p>
            Đăng ký để trải nghiệm mua sắm, thương lượng giá và quản lý đơn
            hàng trong không gian nội thất cao cấp.
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
          {/* Row 1: Username + Email */}
          <div style={twoColGrid}>
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Password + Confirm */}
          <div style={twoColGrid}>
            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3: Full name - full width */}
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Row 4: Phone + Birth date */}
          <div style={twoColGrid}>
            <div className="form-group">
              <label htmlFor="phoneNumber">Số điện thoại</label>
              <input
                id="phoneNumber"
                type="text"
                name="phoneNumber"
                className="form-control"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="birthDate">Ngày sinh</label>
              <input
                id="birthDate"
                type="date"
                name="birthDate"
                className="form-control"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 5: Address - full width */}
          <div className="form-group">
            <label htmlFor="address">Địa chỉ</label>
            <input
              id="address"
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
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
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};