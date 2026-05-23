import { api } from "./api";

export const productService = {
  // Client lấy danh sách (chỉ lấy hàng đang bán)
  getAllActive: (categoryId, searchQ) => {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId);
    if (searchQ) params.append("q", searchQ);
    return api.get(`/api/products?${params.toString()}`);
  },

  getDetail: (id) => api.get(`/api/products/${id}`),

  // ================= ADMIN =================
  // Admin lấy tất cả (bao gồm cả hàng đã ẩn)
  getAllForAdmin: () => api.get("/api/products?includeInactive=true"),

  // Lưu ý: create và update cần truyền FormData vì có upload ảnh
  create: (formData) => api.post("/api/products", formData),
  update: (id, formData) => api.put(`/api/products/${id}`, formData),
  delete: (id) => api.delete(`/api/products/${id}`),
};
