import React from "react";
import { currency } from "../../../utils/formatters";
import { useCheckout } from "../../../hooks/useCheckout";
import CheckoutItem from "../../../components/CheckoutItem";
import "./checkout.css";

const Checkout = () => {
  const {
    cartItems,
    loading,
    submitting,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    processCheckout,
    calculateTotal,
  } = useCheckout();

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Đang tải dữ liệu thanh toán...
      </div>
    );

  return (
    <div className="checkout-container page-container">
      <h1 className="page-title" style={{ marginBottom: "32px" }}>
        Kiểm tra & Đặt đơn
      </h1>

      <div className="checkout-grid">
        {/* Form xử lý thông tin giao hàng và cổng thanh toán */}
        <form onSubmit={processCheckout} className="checkout-form-section">
          <h3 className="checkout-section-title">1. Địa chỉ giao nhận hàng</h3>
          <div className="form-group">
            <label>Địa chỉ cụ thể</label>
            <input
              type="text"
              className="form-control"
              placeholder="Vui lòng cung cấp số nhà, tên đường, phường/xã, quận/huyện..."
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
            />
          </div>

          <h3 className="checkout-section-title" style={{ marginTop: "36px" }}>
            2. Hình thức thanh toán
          </h3>
          <div className="payment-methods-group">
            <div
              className={`payment-method-option ${paymentMethod === 0 ? "active" : ""}`}
              onClick={() => setPaymentMethod(0)}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 0}
                onChange={() => setPaymentMethod(0)}
              />
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    marginBottom: "2px",
                  }}
                >
                  Thanh toán khi nhận hàng (COD)
                </strong>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Thu tiền mặt tận nơi khi bàn giao tác phẩm.
                </span>
              </div>
            </div>

            <div
              className={`payment-method-option ${paymentMethod === 1 ? "active" : ""}`}
              onClick={() => setPaymentMethod(1)}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 1}
                onChange={() => setPaymentMethod(1)}
              />
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    marginBottom: "2px",
                  }}
                >
                  Chuyển khoản tài khoản ngân hàng
                </strong>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Nhận thông tin số tài khoản điều phối sau khi xác lập hệ
                  thống.
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{
              marginTop: "36px",
              height: "48px",
              fontSize: "15px",
              fontWeight: "600",
            }}
            disabled={submitting || cartItems.length === 0}
          >
            {submitting
              ? "Đang thực thi lệnh đặt hàng..."
              : `Xác nhận mua đơn hàng (${currency(calculateTotal())})`}
          </button>
        </form>

        {/* Cột soát xét danh sách hàng hoá thực tế ở bên phải */}
        <div className="checkout-summary-section">
          <h3 className="checkout-section-title">Tổng quan sản phẩm</h3>

          <div className="checkout-items-review">
            {cartItems.map((item) => (
              <CheckoutItem key={item.productId} item={item} />
            ))}
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              <span>Tạm tính giá gốc</span>
              <span>{currency(calculateTotal())}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                fontSize: "14px",
                color: "var(--text-muted)",
              }}
            >
              <span>Chi phí vận tải</span>
              <span style={{ color: "#1F6C55", fontWeight: "500" }}>
                Miễn phí giao hàng
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "16px",
                fontWeight: "700",
                color: "var(--text)",
                paddingTop: "16px",
                borderTop: "1px dashed #ddd",
              }}
            >
              <span>Tổng mức thanh toán</span>
              <span style={{ color: "var(--primary)" }}>
                {currency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
