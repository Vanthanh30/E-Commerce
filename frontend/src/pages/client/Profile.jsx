// src/pages/client/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/client/auth.service";

export const Profile = () => {
  const { user } = useAuth();
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
    if (user?.customerId) {
      const loadProfile = async () => {
        try {
          const profileData = await authService.getCustomer(user.customerId);
          // Định dạng ngày sinh thành yyyy-MM-dd để đẩy vào thẻ <input type="date">
          const formattedDate = profileData.birthDate
            ? profileData.birthDate.substring(0, 10)
            : "";

          setFormData({
            username: profileData.username || "",
            fullName: profileData.fullName || "",
            address: profileData.address || "",
            birthDate: formattedDate,
            email: profileData.email || "",
            oldPassword: "",
            newPassword: "",
          });
          setLoading(false);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      };
      loadProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await authService.updateCustomer(user.customerId, formData);
      setMessage({
        type: "success",
        text: "Cập nhật hồ sơ thành viên Atelier Accord thành công!",
      });
      setFormData({ ...formData, oldPassword: "", newPassword: "" }); // Reset fields mật khẩu
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.message || "Mật khẩu cũ không chính xác.",
      });
    }
  };

  if (loading)
    return (
      <div className="page-container">
        Đang đọc thông tin hồ sơ tài khoản...
      </div>
    );

  return (
    <div className="page-container" style={{ maxWidth: "640px" }}>
      <h1 className="page-title">Thông tin cá nhân</h1>
      <p className="page-subtitle">Quản lý hồ sơ tài khoản Atelier Accord.</p>

      <div className="negotiation-card">
        {message.text && (
          <div
            style={{
              color:
                message.type === "success" ? "var(--primary)" : "var(--danger)",
              marginBottom: "16px",
              fontWeight: "500",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Số điện thoại tài khoản (Mã định danh)</label>
            <input
              type="text"
              className="form-control"
              value={user?.customerId || ""}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ nhận hàng</label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
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
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div
            style={{
              borderTop: "1px dashed var(--border-warm)",
              paddingDelay: "16px",
              marginTop: "24px",
              paddingTop: "16px",
            }}
          >
            <div className="form-group">
              <label style={{ color: "var(--primary)" }}>
                Mật khẩu cũ (Cần thiết để thay đổi)
              </label>
              <input
                type="password"
                name="oldPassword"
                className="form-control"
                value={formData.oldPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Cập nhật thông tin
          </button>
        </form>
      </div>
    </div>
  );
};
