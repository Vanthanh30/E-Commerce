import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services/client/authService";
import "./auth.css";

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    address: "",
    birthDate: "",
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userObj = JSON.parse(sessionStorage.getItem("user"));
        if (!userObj || !userObj.customerId) return navigate("/login");

        setCustomerId(userObj.customerId);
        const response = await authService.getCustomer(userObj.customerId);
        const userData = response.data || response;

        const formattedDate = userData.birthDate
          ? new Date(userData.birthDate).toISOString().split("T")[0]
          : "";

        setFormData({
          username: userData.username || "",
          fullName: userData.fullName || "",
          address: userData.address || "",
          birthDate: formattedDate,
          email: userData.email || "",
          oldPassword: "",
          newPassword: "",
        });
      } catch (err) {
        setMessage({ type: "error", text: "Không thể tải thông tin." });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setUpdating(true);

    try {
      await authService.updateCustomer(customerId, formData);

      setMessage({ type: "success", text: "Cập nhật thành công!" });
      setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Lỗi cập nhật." });
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Đang tải...</div>
    );

  return (
    <div
      className="page-container"
      style={{ maxWidth: "640px", marginTop: "40px" }}
    >
      <h1 className="page-title">Thông tin cá nhân</h1>
      <div className="negotiation-card">
        {message.text && (
          <div
            className={
              message.type === "error" ? "alert-danger" : "alert-success"
            }
            style={{
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: message.type === "error" ? "#FFEBEE" : "#E8F5E9",
              color: message.type === "error" ? "red" : "green",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <hr style={{ margin: "24px 0", borderTop: "1px solid #eee" }} />

          <div className="form-group">
            <label>Mật khẩu hiện tại (Bắt buộc)</label>
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
            <label>Mật khẩu mới (Tùy chọn)</label>
            <input
              type="password"
              name="newPassword"
              className="form-control"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={updating}
          >
            {updating ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
