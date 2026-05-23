import { api } from "../api";

export const statsService = {
  getOrdersByMonth: (year) =>
    api.get(`/api/stats/orders-by-month?year=${year}`),
  getRevenueByMonth: (year) =>
    api.get(`/api/stats/revenue-by-month?year=${year}`),

  // API Admin trả lời mặc cả (Accept / Reject / Counter)
  respondBargain: (id, actionData) =>
    api.post(`/api/bargains/${id}/respond`, actionData),
  // Lấy danh sách mặc cả cần xử lý
  getPendingBargains: () => api.get("/api/bargains?admin=true"),
};
