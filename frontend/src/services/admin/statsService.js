import { api } from "../api";

export const statsService = {
  getRevenueByMonth: (year) => api.get(`/stats/revenue-by-month?year=${year}`),
  getOrdersByMonth: (year) => api.get(`/stats/orders-by-month?year=${year}`),
};
