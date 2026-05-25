import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    const userRole = sessionStorage.getItem("role");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
        setRole(userRole);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const logout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    setUser(null);
    setRole(null);
    navigate("/login");
  };

  return { user, role, logout };
};
