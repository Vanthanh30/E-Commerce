import { api } from "../api";

export const bargainService = {
  // Tạo đề xuất giá mới (đã có)
  create: (data) => api.post("/bargains", data),

  // Lấy danh sách lịch sử trả giá của khách hàng (chỉ vòng mới nhất)
  getBargains: (customerId) => api.get(`/bargains?customerId=${customerId}&latest=true`),

  // Chat với chatbot mặc cả
  chat: (data) => api.post("/bargains/chat", data),

  // Lấy chi tiết phiên bargain (tất cả vòng)
  getById: (bargainId) => api.get(`/bargains/${bargainId}`),
};
