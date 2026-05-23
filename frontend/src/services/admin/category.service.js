import { api } from "../api";

export const categoryService = {
  getAll: (includeInactive = false) =>
    api.get(`/api/categories?includeInactive=${includeInactive}`),
  create: (data) => api.post("/api/categories", data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};
