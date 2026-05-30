import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { currency } from "../../../utils/formatters";
import { useCart } from "../../../hooks/useCart";
import CartItem from "../../../components/client/CartItem";
import "./cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const { cartItems, loading, error, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!sessionStorage.getItem("user")) {
      navigate("/login");
    }
  }, [navigate]);

  const cartItemIds = useMemo(
    () => cartItems.map((item) => item.cartItemId || item.productId),
    [cartItems],
  );

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = new Set(cartItemIds);
      const next = prev.filter((id) => validIds.has(id));
      return next.length || cartItemIds.length === 0 ? next : cartItemIds;
    });
  }, [cartItemIds]);

  const selectedItems = cartItems.filter((item) =>
    selectedIds.includes(item.cartItemId || item.productId),
  );
  const isAllSelected =
    cartItemIds.length > 0 && selectedIds.length === cartItemIds.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : cartItemIds);
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  const calculateSelectedTotal = () =>
    selectedItems.reduce(
      (sum, item) => sum + (item.price || item.fixedPrice || 0) * item.quantity,
      0,
    );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }

    sessionStorage.setItem("checkoutItemIds", JSON.stringify(selectedIds));
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "red" }}>
        {error}
      </div>
    );
  }

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
          <div className="cart-items-list">
            <label className="cart-select-all">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
              />
              <span>Chọn tất cả</span>
            </label>

            {cartItems.map((item) => (
              <CartItem
                key={item.cartItemId || `${item.productId}-${item.priceType || "fixed"}`}
                item={item}
                checked={selectedIds.includes(item.cartItemId || item.productId)}
                onToggleSelect={toggleSelectItem}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>

            <div className="summary-row">
              <span>Sản phẩm đã chọn</span>
              <span>{selectedItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span style={{ color: "#1F6C55", fontWeight: "500" }}>
                Miễn phí
              </span>
            </div>

            <div className="summary-total">
              <span>Tổng cộng</span>
              <span>{currency(calculateSelectedTotal())}</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              style={{
                marginTop: "24px",
                height: "46px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
