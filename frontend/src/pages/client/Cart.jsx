// src/pages/client/Cart.jsx
import React, { useState, useEffect } from "react";
import { cartService } from "../../services/client/cart.service";
import { currency } from "../../utils/formatters";

export const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const customerId = "0900000001"; // TODO: Lấy từ Auth Context sau khi đăng nhập

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart(customerId);
      setCartItems(data);
    } catch (error) {
      console.error("Lỗi tải giỏ hàng:", error);
    }
  };

  const removeItem = async (productId) => {
    try {
      const data = await cartService.removeItem(customerId, productId);
      setCartItems(data); // API backend trả về giỏ hàng mới
    } catch (error) {
      console.error("Lỗi xóa SP:", error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="page-container">
      <h1 className="page-title">Giỏ hàng của bạn</h1>
      <div className="cart-layout">
        <div>
          {cartItems.length === 0 ? (
            <div className="empty-state">Giỏ hàng trống</div>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId} className="cart-item-card">
                <button
                  className="cart-remove"
                  onClick={() => removeItem(item.productId)}
                >
                  ×
                </button>
                <div className="cart-item-image">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.productName}</div>
                  <div className="qty-controls">
                    {/* Dòng 51 (Nút trừ) */}
                    <button
                      className="qty-btn"
                      onClick={() => {
                        /* Gọi API giảm sl */
                      }}
                    >
                      −
                    </button>

                    {/* Dòng 53 (Nút cộng) */}
                    <button
                      className="qty-btn"
                      onClick={() => {
                        /* Gọi API tăng sl */
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-price">{currency(item.total)}</div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{currency(total)}</span>
          </div>
          <div className="summary-total">
            <span>Tổng cộng</span>
            <span>{currency(total)}</span>
          </div>
          <button className="btn btn-primary btn-block">
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};
