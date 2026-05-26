// src/services/client/categoryService.js
import { api } from "../api";

export const categoryService = {
  getAll: () => api.get("/categories"),
};
