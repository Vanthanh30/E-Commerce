import { api } from "../api";

export const productService = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post("/products", formData),
  update: (id, formData) => api.put(`/products/${id}`, formData),
  delete: (id) => api.delete(`/products/${id}`),
};
