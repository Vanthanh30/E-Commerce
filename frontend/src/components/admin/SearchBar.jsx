// src/components/admin/SearchBar.jsx

import React, { useRef, useEffect } from "react";
import useProductSearch from "../../hooks/useProductSearch";

const SearchBar = ({
    onSelectProduct,
    placeholder = "Tìm kiếm sản phẩm...",
}) => {
    const containerRef = useRef(null);

    const {
        query, setQuery, results, loading, error,
        isOpen, clearSearch, closeDropdown,
    } = useProductSearch();

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                closeDropdown();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [closeDropdown]);

    const handleSelect = (product) => {
        clearSearch();
        onSelectProduct?.(product);
    };

    return (
        <div ref={containerRef} style={{ position: "relative", flex: 1, maxWidth: "400px", margin: "0 24px" }}>
            {/* Input */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && clearSearch()}
                    placeholder={placeholder}
                    style={{
                        width: "100%", padding: "8px 40px 8px 14px",
                        border: "1px solid var(--border-color, #E5E7EB)",
                        borderRadius: "8px", fontSize: "14px", outline: "none",
                        background: "var(--input-bg, #F9FAFB)",
                        color: "var(--text-color, #374151)", transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--primary, #6366F1)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-color, #E5E7EB)")}
                />
                <span
                    style={{
                        position: "absolute", right: "12px", display: "flex",
                        alignItems: "center", color: "var(--text-muted, #9CA3AF)",
                        cursor: query ? "pointer" : "default",
                    }}
                    onClick={query ? clearSearch : undefined}
                >
                    {loading ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.8s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </svg>
                    ) : query ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    )}
                </span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: "#fff", border: "1px solid var(--border-color, #E5E7EB)",
                    borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    zIndex: 1000, overflow: "hidden", maxHeight: "360px", overflowY: "auto",
                }}>
                    {error && (
                        <div style={{ padding: "14px 16px", color: "#EF4444", fontSize: "13px" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {!error && results.length === 0 && !loading && (
                        <div style={{ padding: "14px 16px", color: "var(--text-muted, #9CA3AF)", fontSize: "13px", textAlign: "center" }}>
                            Không tìm thấy sản phẩm nào cho <strong>"{query}"</strong>
                        </div>
                    )}

                    {results.map((product) => (
                        <button
                            key={product._id ?? product.productId}
                            onClick={() => handleSelect(product)}
                            style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                width: "100%", padding: "10px 14px", background: "none",
                                border: "none", borderBottom: "1px solid var(--border-color, #F3F4F6)",
                                cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                            {/* Thumbnail — dùng đúng field imageUrl từ BE */}
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                                />
                            ) : (
                                <div style={{
                                    width: 40, height: 40, borderRadius: "6px", flexShrink: 0,
                                    background: "#F3F4F6", display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: "18px",
                                }}>
                                    📦
                                </div>
                            )}

                            {/* Tên + danh mục */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontWeight: 600, fontSize: "14px",
                                    color: "var(--text-color, #111827)",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                    {product.name}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted, #6B7280)", marginTop: "2px" }}>
                                    {product.categoryName ?? ""}
                                    {product.minPrice != null && (
                                        <span style={{ marginLeft: "8px", color: "var(--primary, #6366F1)", fontWeight: 600 }}>
                                            {Number(product.minPrice).toLocaleString("vi-VN")}₫
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Badge tồn kho */}
                            {product.stock != null && (
                                <span style={{
                                    fontSize: "11px", padding: "2px 8px", borderRadius: "999px",
                                    background: product.stock > 0 ? "#D1FAE5" : "#FEE2E2",
                                    color: product.stock > 0 ? "#065F46" : "#991B1B",
                                    fontWeight: 600, flexShrink: 0,
                                }}>
                                    {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;