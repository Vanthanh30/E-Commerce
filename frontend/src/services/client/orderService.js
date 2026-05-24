import { api } from "../api";

export const orderService = {
  // Gửi yêu cầu tạo đơn hàng mới lên Backend (hàm createOrder trong order.controller.js)
  create: (data) => api.post("/orders", data),

  // Lấy danh sách đơn hàng của khách hàng hiện tại
  getOrders: (customerId) => api.get(`/orders?customerId=${customerId}`),

  // Lấy chi tiết một đơn hàng cụ thể dựa vào orderId
  getById: (id) => api.get(`/orders/${id}`),
};
