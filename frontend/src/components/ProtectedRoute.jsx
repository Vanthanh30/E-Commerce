// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const role = sessionStorage.getItem("role");

  // Nếu chưa đăng nhập hoặc sai quyền, đẩy về login
  if (!role || role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đúng quyền, cho phép vào trang
  return children;
};

export default ProtectedRoute;
