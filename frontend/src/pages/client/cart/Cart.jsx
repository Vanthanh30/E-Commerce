import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { currency } from "../../../utils/formatters";
import { useCart } from "../../../hooks/useCart";
import CartItem from "../../../components/client/CartItem";
import "./cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { cartItems, loading, error, updateQuantity, removeItem } = useCart();

  const initialSelectDone = useRef(false);

  useEffect(() => {
    if (!sessionStorage.getItem("user")) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cartItemIds = useMemo(() => {
    return cartItems
      .filter((item) => {
        if (!item.orderSessionExpiresAt) return true;
        return new Date(item.orderSessionExpiresAt).getTime() > currentTime;
      })
      .map((item) => item.cartItemId || item.productId);
  }, [cartItems, currentTime]);

  useEffect(() => {
    if (cartItemIds.length > 0 && !initialSelectDone.current) {
      setSelectedIds(cartItemIds);
      initialSelectDone.current = true;
    }
  }, [cartItemIds]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = new Set(cartItemIds);
      const next = prev.filter((id) => validIds.has(id));
      if (next.length !== prev.length) return next;
      return prev;
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
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
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
          <Link to="/products" className="btn btn-primary">
            Quay lại cửa hàng
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-items-wrapper">
            <label className="cart-select-all">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                disabled={cartItemIds.length === 0}
              />
              <span>Chọn tất cả</span>
            </label>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const isBargain = !!item.orderSessionExpiresAt;
                const isExpired =
                  isBargain &&
                  new Date(item.orderSessionExpiresAt).getTime() <= currentTime;

                let timeLeftText = "";
                if (isBargain && !isExpired) {
                  const diffMs =
                    new Date(item.orderSessionExpiresAt).getTime() -
                    currentTime;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffSecs = Math.floor((diffMs % 60000) / 1000);
                  timeLeftText = `${diffMins}p ${diffSecs}s`;
                }

                return (
                  <div
                    key={item.cartItemId || item.productId}
                    style={{
                      opacity: isExpired ? 0.5 : 1,
                      position: "relative",
                    }}
                  >
                    {isExpired && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          color: "#dc2626",
                          fontSize: "11px",
                          fontWeight: "bold",
                          background: "#fee2e2",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          zIndex: 10,
                        }}
                      >
                        Đã hết hạn thương lượng
                      </div>
                    )}

                    {isBargain && !isExpired && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          color: "#b45309",
                          fontSize: "11px",
                          fontWeight: "bold",
                          background: "#fef3c7",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          zIndex: 10,
                        }}
                      >
                        Giữ giá trong: {timeLeftText}
                      </div>
                    )}

                    <div style={{ pointerEvents: isExpired ? "none" : "auto" }}>
                      <CartItem
                        item={item}
                        checked={
                          !isExpired &&
                          selectedIds.includes(
                            item.cartItemId || item.productId,
                          )
                        }
                        onToggleSelect={isExpired ? () => {} : toggleSelectItem}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>
            <div className="summary-row">
              <span>Sản phẩm đã chọn</span>
              <span>
                {selectedItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span style={{ color: "var(--primary)", fontWeight: "500" }}>
                Miễn phí
              </span>
            </div>
            <div className="summary-total">
              <span>Tổng cộng</span>
              <span className="total-amount">
                {currency(calculateSelectedTotal())}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
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
