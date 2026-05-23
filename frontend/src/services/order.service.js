import { api } from "./api";

export const orderService = {
  // Client
  create: (data) => api.post("/api/orders", data),
  getListByCustomer: (customerId) =>
    api.get(`/api/orders?customerId=${customerId}`),
  getDetail: (id) => api.get(`/api/orders/${id}`),

  // ================= ADMIN =================
  getAllForAdmin: (status) => {
    const params = status ? `?status=${status}` : "";
    return api.get(`/api/orders${params}`);
  },
  updateStatus: (id, status) =>
    api.patch(`/api/orders/${id}/status`, { status }),
};
