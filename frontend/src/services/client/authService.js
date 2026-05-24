import { api } from "../api";

export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getCustomer: (id) => api.get(`/auth/customers/${id}`),
  updateCustomer: (id, data) => api.put(`/auth/customers/${id}`, data),
};
