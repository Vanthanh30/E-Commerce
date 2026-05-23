import { api } from "../api";

export const bargainService = {
  // Lấy lịch sử trả giá của 1 user
  getListByCustomer: (customerId) =>
    api.get(`/api/bargains?customerId=${customerId}`),
  getDetail: (id) => api.get(`/api/bargains/${id}`),
  // Gửi yêu cầu mặc cả (tạo mới hoặc trả giá tiếp)
  createOrUpdate: (data) => api.post("/api/bargains", data),
};
