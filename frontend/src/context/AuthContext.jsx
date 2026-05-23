// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem("role") || null;
  });

  const loginGlobal = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userRole);
  };

  const logoutGlobal = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loginGlobal, logoutGlobal, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
