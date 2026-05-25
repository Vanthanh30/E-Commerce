import { api } from "../api";

export const cartService = {
  getCart: (customerId) => api.get(`/cart/${customerId}`),
  addToCart: (data) => api.post("/cart", data),
  updateQuantity: (customerId, productId, quantity) =>
    api.patch(`/cart/${customerId}/${productId}`, { quantity }),
  removeItem: (customerId, productId) =>
    api.delete(`/cart/${customerId}/${productId}`),
};
