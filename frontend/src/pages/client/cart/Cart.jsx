import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { currency } from "../../../utils/formatters";
// Sử dụng Hook và Component đã tách
import { useCart } from "../../../hooks/useCart";
import CartItem from "../../../components/client/CartItem";
import "./cart.css";

const Cart = () => {
  const navigate = useNavigate();
  // Giao quyền xử lý logic cho Custom Hook
  const {
    cartItems,
    loading,
    error,
    updateQuantity,
    removeItem,
    calculateTotal,
  } = useCart();

  useEffect(() => {
    if (!sessionStorage.getItem("user")) {
      navigate("/login");
    }
  }, [navigate]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Đang tải giỏ hàng...
      </div>
    );
  if (error)
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "red" }}>
        {error}
      </div>
    );

  return (
    <div className="cart-container page-container">
      <h1 className="page-title" style={{ marginBottom: "32px" }}>
        Giỏ hàng của bạn
      </h1>

      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <i className="material-icons">shopping_bag</i>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            Hãy tìm kiếm và chọn lựa các tác phẩm nội thất độc bản từ bộ sưu tập
            của chúng tôi.
          </p>
          <Link to="/" className="btn btn-primary">
            Quay lại cửa hàng
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Cột trái: Sử dụng Component tách rời */}
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Cột phải: Bảng tính tiền (Summary) */}
          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>

            <div className="summary-row">
              <span>Số lượng mặt hàng</span>
              <span>{cartItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span style={{ color: "#1F6C55", fontWeight: "500" }}>
                Miễn phí
              </span>
            </div>

            <div className="summary-total">
              <span>Tổng cộng</span>
              <span>{currency(calculateTotal())}</span>
            </div>

            <Link
              to="/checkout"
              className="btn btn-primary btn-block"
              style={{
                marginTop: "24px",
                height: "46px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Tiến hành thanh toán
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
