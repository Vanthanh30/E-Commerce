import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { authService } from "../../../services/client/auth.service";
import styles from "./Profile.module.css";

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    address: "",
    birthDate: "",
    oldPassword: "",
    newPassword: "",
    email: "",
  });

  useEffect(() => {
    if (!user?.customerId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const profileData = await authService.getCustomer(user.customerId);
        setFormData({
          username: profileData.username || "",
          fullName: profileData.fullName || "",
          address: profileData.address || "",
          birthDate: profileData.birthDate ? profileData.birthDate.substring(0, 10) : "",
          email: profileData.email || "",
          oldPassword: "",
          newPassword: "",
        });
      } catch (error) {
        console.error("Lỗi tải thông tin cá nhân:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await authService.updateCustomer(user.customerId, formData);
      setMessage({ type: "success", text: "Cập nhật hồ sơ tài khoản Atelier Accord thành công!" });
      setFormData({ ...formData, oldPassword: "", newPassword: "" });
    } catch (error) {
      setMessage({ type: "danger", text: error.message || "Mật khẩu cũ không chính xác." });
    }
  };

  /* ── Loading state ── */
  if (loading) {
    return <div className={styles.stateMessage}>Đang đọc thông tin hồ sơ tài khoản...</div>;
  }

  /* ── Chưa đăng nhập ── */
  if (!user?.customerId) {
    return (
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Thông tin cá nhân</h1>
        <p className={styles.pageSubtitle}>
          Vui lòng đăng nhập để quản lý hồ sơ tài khoản Atelier Accord.
        </p>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => navigate("/login")}
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  /* ── Form chính ── */
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Thông tin cá nhân</h1>
      <p className={styles.pageSubtitle}>Quản lý hồ sơ tài khoản Atelier Accord.</p>

      <div className={styles.card}>
        {message.text && (
          <div className={message.type === "success" ? styles.alertSuccess : styles.alertDanger}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className={styles.formGroup}>
            <label>Số điện thoại</label>
            <input type="text" className={styles.formControl} value={user.customerId} readOnly />
          </div>

          <div className={styles.formGroup}>
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              className={styles.formControl}
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Địa chỉ</label>
            <input
              type="text"
              name="address"
              className={styles.formControl}
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Ngày sinh</label>
            <input
              type="date"
              name="birthDate"
              className={styles.formControl}
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className={styles.formControl}
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Divider trước section đổi mật khẩu */}
          <hr className={styles.sectionDivider} />
          <p className={styles.sectionLabel}>Đổi mật khẩu</p>

          <div className={styles.formGroup}>
            <label>Mật khẩu cũ</label>
            <input
              type="password"
              name="oldPassword"
              className={styles.formControl}
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              className={styles.formControl}
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              className={styles.formControl}
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.btnPrimary}>
            Cập nhật thông tin
          </button>
        </form>
      </div>
    </div>
  );
};