import { useState, useEffect, useCallback } from "react";
import { bargainService } from "../services/client/bargainService";

export const useBargains = () => {
  const [bargains, setBargains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBargains = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user || !user.customerId) return;

      const response = await bargainService.getBargains(user.customerId);
      // API interceptor trả về data trực tiếp, không cần .data
      setBargains(Array.isArray(response) ? response : []);
    } catch (err) {
      setError(err.message || "Lỗi khi tải lịch sử thương lượng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBargains();
  }, [fetchBargains]);

  return { bargains, loading, error, fetchBargains };
};
