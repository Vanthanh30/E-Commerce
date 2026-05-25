import { api } from "../api";

export const bargainService = {
  getAll: (params) => api.get("/bargains", { params }),
  getById: (id) => api.get(`/bargains/${id}`),
  create: (data) => api.post("/bargains", data),
  respond: (id, status) => api.post(`/bargains/${id}/respond`, { status }),
};
