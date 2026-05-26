import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cartService } from "../services/client/cartService";
import { orderService } from "../services/client/orderService";

export const useCheckout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(0); // 0: COD (Theo mặc định order.helper.js)

  // Tải thông tin xem trước đơn hàng từ giỏ hàng hiện tại
  const loadCheckoutData = useCallback(async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.customerId) {
        navigate("/login");
        return;
      }

      // Lấy các sản phẩm trong giỏ hàng để hiển thị soát xét trước khi nhấn mua
      const response = await cartService.getCart(user.customerId);
      const items = response.items || response.data || response || [];
      setCartItems(items);

      // Tự động điền trước địa chỉ nếu hồ sơ cá nhân đã có sẵn dữ liệu
      if (user.address) {
        setShippingAddress(user.address);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu thanh toán:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  // Xử lý logic gửi đơn hàng tuần tự
  const processCheckout = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      alert("Vui lòng nhập địa chỉ nhận hàng.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Giỏ hàng trống, không thể tiến hành thanh toán.");
      return;
    }

    setSubmitting(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));

      // Gom toàn bộ sản phẩm thành 1 mảng
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.fixedPrice || item.price,
      }));

      // Gọi API TẠO 1 ĐƠN HÀNG DUY NHẤT chứa toàn bộ sản phẩm
      await orderService.create({
        customerId: user.customerId,
        items: orderItems,
        address: shippingAddress,
        paymentMethod: Number(paymentMethod),
        status: 1,
      });

      alert("Đặt hàng thành công!");
      navigate("/orders");
    } catch (err) {
      alert(
        err.message ||
          "Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
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
    submitting,
    shippingAddress,
    setShippingAddress,
    paymentMethod,
    setPaymentMethod,
    processCheckout,
    calculateTotal,
  };
};
