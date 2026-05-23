import { api } from "../api";

export const authService = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
  getCustomer: (id) => api.get(`/api/auth/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/api/auth/customers/${id}`, data),
};
