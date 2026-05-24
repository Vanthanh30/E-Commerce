import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/client/auth.service";
import styles from "./Register.module.css";

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
      setError(err.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
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
          <span className={styles.authBadge}>THÀNH VIÊN MỚI</span>
          <h1>Tham gia Atelier Accord</h1>
          <p>
            Đăng ký để trải nghiệm mua sắm, thương lượng giá và quản lý đơn
            hàng trong không gian nội thất cao cấp.
          </p>
        </div>
      </div>

      {/* ── Cột phải: Form ── */}
      <div className={styles.authPanel}>
        <h2>Đăng ký tài khoản</h2>
        <p className={styles.lead}>
          Trở thành thành viên để trải nghiệm mua sắm tốt nhất.
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleRegister}>
          {/* Row 1: Username + Email */}
          <div className={styles.twoColGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Tên đăng nhập</label>
              <input id="username" type="text" name="username" className={styles.formControl} value={formData.username} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" name="email" className={styles.formControl} value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 2: Password + Confirm */}
          <div className={styles.twoColGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Mật khẩu</label>
              <input id="password" type="password" name="password" className={styles.formControl} value={formData.password} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input id="confirmPassword" type="password" name="confirmPassword" className={styles.formControl} value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 3: Full name */}
          <div className={styles.formGroup}>
            <label htmlFor="fullName">Họ và tên</label>
            <input id="fullName" type="text" name="fullName" className={styles.formControl} value={formData.fullName} onChange={handleChange} required />
          </div>

          {/* Row 4: Phone + Birth date */}
          <div className={styles.twoColGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Số điện thoại</label>
              <input id="phoneNumber" type="text" name="phoneNumber" className={styles.formControl} value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="birthDate">Ngày sinh</label>
              <input id="birthDate" type="date" name="birthDate" className={styles.formControl} value={formData.birthDate} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 5: Address */}
          <div className={styles.formGroup}>
            <label htmlFor="address">Địa chỉ</label>
            <input id="address" type="text" name="address" className={styles.formControl} value={formData.address} onChange={handleChange} required />
          </div>

          <button type="submit" className={styles.btnPrimary}>
            Tạo tài khoản
          </button>
        </form>

        <p className={styles.loginLink}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};