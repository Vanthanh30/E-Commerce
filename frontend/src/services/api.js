import axios from "axios";

// Lấy URL từ biến môi trường hoặc mặc định là port 4000 như code cũ của bạn
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// 1. Khởi tạo Axios Instance
const apiClient = axios.create({
  baseURL: `${API_URL}/api`, // Tự động thêm /api vào sau URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 2. Thêm Token vào mỗi request (nếu có)
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Nếu body là FormData (ví dụ upload ảnh), Axios tự xử lý Content-Type, ta cần xóa header json đi
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// 3. Tối ưu Response: Chỉ trả về data, bắt lỗi chuẩn xác
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Yêu cầu thất bại";
    return Promise.reject(new Error(message));
  },
);

// 4. Giữ nguyên object `api` để gọi cho gọn (giống hệt cấu trúc code cũ của bạn)
export const api = {
  get: (path, config) => apiClient.get(path, config),
  post: (path, body, config) => apiClient.post(path, body, config),
  put: (path, body, config) => apiClient.put(path, body, config),
  patch: (path, body, config) => apiClient.patch(path, body, config),
  delete: (path, config) => apiClient.delete(path, config),
};

export default apiClient;
