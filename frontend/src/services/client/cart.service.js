import { api } from "../api";

export const cartService = {
  getCart: (customerId) => api.get(`/api/cart/${customerId}`),
  addToCart: (data) => api.post("/api/cart", data),
  updateQuantity: (customerId, productId, quantity) =>
    api.patch(`/api/cart/${customerId}/${productId}`, { quantity }),
  removeItem: (customerId, productId) =>
    api.delete(`/api/cart/${customerId}/${productId}`),
};
