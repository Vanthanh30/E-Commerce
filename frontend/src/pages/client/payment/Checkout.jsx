import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { orderService } from "../../../services/order.service";
import { currency } from "../../../utils/formatters";

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Lấy dữ liệu sản phẩm được truyền từ trang Chi tiết hoặc Giỏ hàng
  const product = location.state?.product;
  const quantity = location.state?.quantity || 1;

  const [address, setAddress] = useState(user?.address || "");
  const [note, setNote] = useState("");

  if (!product)
    return (
      <div className="page-container">
        Lỗi: Không tìm thấy sản phẩm để thanh toán.
      </div>
    );

  const total = product.fixedPrice * quantity;

  const handlePlaceOrder = async (paymentMethod) => {
    try {
      const orderData = {
        customerId: user.customerId,
        productId: product.productId || product.idSP,
        quantity: quantity,
        price: product.fixedPrice,
        address: address,
        note: note,
        paymentMethod: paymentMethod, // 0: COD, 1: Online
      };

      const res = await orderService.create(orderData);

      if (paymentMethod === 1) {
        // Chuyển sang trang Quét mã QR
        navigate("/payment", { state: { orderId: res.orderId, total } });
      } else {
        alert("Đặt hàng COD thành công!");
        navigate("/orders");
      }
    } catch (error) {
      alert("Đặt hàng thất bại: " + error.message);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "720px" }}>
      <h1 className="page-title">Đặt hàng</h1>
      <div className="negotiation-card">
        <p>
          <strong>{product.name || product.tenSanPham}</strong>
        </p>
        <p className="page-subtitle">
          Số lượng: {quantity} · Đơn giá: {currency(product.fixedPrice)}
        </p>

        <div className="form-group" style={{ marginTop: "24px" }}>
          <label>Địa chỉ nhận hàng</label>
          <input
            type="text"
            className="form-control"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            className="form-control"
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vận chuyển cẩn thận nhé..."
          ></textarea>
        </div>

        <p className="summary-total" style={{ margin: "20px 0" }}>
          <span>Tổng tiền</span>
          <span>{currency(total)}</span>
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            onClick={() => handlePlaceOrder(0)}
          >
            Đặt hàng COD
          </button>
          <button
            className="btn btn-outline"
            onClick={() => handlePlaceOrder(1)}
          >
            Thanh toán Online
          </button>
        </div>
      </div>
    </div>
  );
};
