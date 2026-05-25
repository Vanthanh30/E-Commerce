// src/hooks/useProductSearch.js

import { useState, useEffect, useCallback, useRef } from "react";
import { productService } from "../services/admin/productService";

const useProductSearch = (options = {}) => {
    const { debounceMs = 350, minLength = 2, maxResults = 8 } = options;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const debounceTimer = useRef(null);

    const search = useCallback(async (searchQuery) => {
        // api instance đã unwrap response.data — res chính là mảng sản phẩm
        const res = await productService.getAll({
            q: searchQuery,
            includeInactive: "true",
        });
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.products)) return res.products;
        return [];
    }, []);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (query.trim().length < minLength) {
            setResults([]);
            setIsOpen(false);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        debounceTimer.current = setTimeout(async () => {
            try {
                const data = await search(query.trim());
                setResults(data.slice(0, maxResults));
                setIsOpen(true);
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi tìm kiếm.";
                setError(msg);
                setResults([]);
                setIsOpen(true);
            } finally {
                setLoading(false);
            }
        }, debounceMs);

        return () => clearTimeout(debounceTimer.current);
    }, [query, search, debounceMs, minLength, maxResults]);

    const clearSearch = useCallback(() => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setError(null);
        setLoading(false);
    }, []);

    const closeDropdown = useCallback(() => setIsOpen(false), []);

    return { query, setQuery, results, loading, error, isOpen, clearSearch, closeDropdown };
};

export default useProductSearch;