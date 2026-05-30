import { useState, useEffect, useCallback } from "react";
import { orderService } from "../services/client/orderService";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOrders([]);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.customerId) {
        setLoading(false);
        return;
      }

      const response = await orderService.getOrders(user.customerId);
      setOrders(response.data || response || []);
    } catch (err) {
      setOrders([]);
      setError(err.message || "Lỗi khi tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (orderId) => {
    await orderService.cancel(orderId);
    await fetchOrders();
  };

  return { orders, loading, error, fetchOrders, cancelOrder };
};
