import { useState, useEffect, useCallback } from "react";
import { cartService } from "../services/client/cartService";

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dùng useCallback để hàm không bị tạo lại mỗi lần render
  const fetchCartData = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.customerId) return;

      // Gọi service với customerId lấy từ sessionStorage
      const response = await cartService.getCart(user.customerId);
      setCartItems(response.items || response.data || response || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải dữ liệu ngay khi khởi tạo Hook
  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) fetchCartData();
    else setLoading(false);
  }, [fetchCartData]);

  const updateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const response = await cartService.updateQuantity(
        user.customerId,
        productId,
        newQty,
      );
      setCartItems(response.items || response.data || response || []);
    } catch (err) {
      alert("Không thể cập nhật số lượng.");
    }
  };

  const removeItem = async (productId) => {
    if (!window.confirm("Xóa sản phẩm khỏi giỏ hàng?")) return;
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const response = await cartService.removeItem(user.customerId, productId);
      setCartItems(response.items || response.data || response || []);
    } catch (err) {
      alert("Không thể xóa sản phẩm.");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price || item.fixedPrice || 0) * item.quantity,
      0,
    );
  };

  return {
    cartItems,
    loading,
    error,
    updateQuantity,
    removeItem,
    calculateTotal,
    fetchCartData,
  };
};
