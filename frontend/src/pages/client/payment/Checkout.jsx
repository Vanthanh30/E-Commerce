import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { orderService } from "../../../services/order.service";
import { currency } from "../../../utils/formatters";
import styles from "./Checkout.module.css";

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const product = location.state?.product;
  const quantity = location.state?.quantity || 1;

  const [address, setAddress] = useState(user?.address || "");
  const [note, setNote] = useState("");

  if (!product) {
    return (
      <div className={styles.errorState}>
        Lỗi: Không tìm thấy sản phẩm để thanh toán.
      </div>
    );
  }

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
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Đặt hàng</h1>

      <div className={styles.card}>
        {/* Product summary */}
        <p className={styles.productName}>{product.name || product.tenSanPham}</p>
        <p className={styles.productMeta}>
          Số lượng: {quantity} · Đơn giá: {currency(product.fixedPrice)}
        </p>

        {/* Address */}
        <div className={styles.formGroup}>
          <label>Địa chỉ nhận hàng</label>
          <input
            type="text"
            className={styles.formControl}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* Note */}
        <div className={styles.formGroup}>
          <label>Ghi chú</label>
          <textarea
            className={styles.formControl}
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Vận chuyển cẩn thận nhé..."
          />
        </div>

        {/* Total */}
        <div className={styles.summaryTotal}>
          <span>Tổng tiền</span>
          <span className={styles.summaryTotalValue}>{currency(total)}</span>
        </div>

        {/* Actions */}
        <div className={styles.btnGroup}>
          <button className={styles.btnPrimary} onClick={() => handlePlaceOrder(0)}>
            Đặt hàng COD
          </button>
          <button className={styles.btnOutline} onClick={() => handlePlaceOrder(1)}>
            Thanh toán Online
          </button>
        </div>
      </div>
    </div>
  );
};