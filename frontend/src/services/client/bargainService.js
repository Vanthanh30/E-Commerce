import { api } from "../api";

export const bargainService = {
  // Tạo đề xuất giá mới (đã có)
  create: (data) => api.post("/bargains", data),

  // THÊM MỚI: Lấy danh sách lịch sử trả giá của khách hàng
  getBargains: (customerId) => api.get(`/bargains?customerId=${customerId}`),
};
