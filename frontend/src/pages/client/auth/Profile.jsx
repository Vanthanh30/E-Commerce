import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { authService } from "../../../services/client/auth.service";

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
          birthDate: profileData.birthDate
            ? profileData.birthDate.substring(0, 10)
            : "",
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
      setMessage({
        type: "success",
        text: "Cập nhật hồ sơ tài khoản Atelier Accord thành công!",
      });
      setFormData({ ...formData, oldPassword: "", newPassword: "" });
    } catch (error) {
      setMessage({
        type: "danger",
        text: error.message || "Mật khẩu cũ không chính xác.",
      });
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        Đang đọc thông tin hồ sơ tài khoản...
      </div>
    );
  }

  if (!user?.customerId) {
    return (
      <div className="page-container" style={{ maxWidth: "640px" }}>
        <h1 className="page-title">Thông tin cá nhân</h1>
        <p className="page-subtitle">
          Vui lòng đăng nhập để quản lý hồ sơ tài khoản Atelier Accord.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/login")}
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: "640px" }}>
      <h1 className="page-title">Thông tin cá nhân</h1>
      <p className="page-subtitle">
        Quản lý hồ sơ tài khoản Atelier Accord.
      </p>

      <div className="negotiation-card">
        {message.text && (
          <div
            style={{
              color:
                message.type === "success" ? "var(--primary)" : "var(--danger)",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              value={user.customerId}
              readOnly
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
            <label>Địa chỉ</label>
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

          <div className="form-group">
            <label>Mật khẩu cũ</label>
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

          <div className="form-group">
            <label>Email</label>
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
