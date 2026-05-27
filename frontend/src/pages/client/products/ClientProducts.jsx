import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../../../services/client/productService";
import { categoryService } from "../../../services/client/categoryService";
import ProductCard from "../../../components/client/ProductCard";
import "../home/home.css";

const ITEMS_PER_PAGE = 12;

const ClientProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const currentCategoryId = searchParams.get("categoryId") || "all";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
        ]);
        setAllProducts(prodRes.data || prodRes || []);
        setCategories([
          { categoryId: "all", name: "Tất cả" },
          ...(catRes.data || catRes || []),
        ]);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered =
    currentCategoryId === "all"
      ? allProducts
      : allProducts.filter((p) => p.categoryId === currentCategoryId);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>Đang tải...</div>
    );

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);
    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: "30px" }}>
        Bộ sưu tập Atelier
      </h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "40px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            onClick={() => {
              setSearchParams(
                cat.categoryId === "all" ? {} : { categoryId: cat.categoryId },
              );
              setCurrentPage(1);
            }}
            className={`btn ${currentCategoryId === cat.categoryId ? "btn-primary" : "btn-outline"}`}
            style={{ borderRadius: "20px" }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((item) => (
            <ProductCard key={item.productId} item={item} />
          ))
        ) : (
          <p>Không có sản phẩm.</p>
        )}
      </div>

      {/* PHÂN TRANG DẠNG SỐ */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "40px",
          }}
        >
          {/* Nút Previous */}
          <button
            className="btn btn-outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <i className="material-icons" style={{ fontSize: "18px" }}>
              chevron_left
            </i>
          </button>

          {/* Render các nút số trang */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => page !== "..." && handlePageChange(page)}
              className={`btn ${currentPage === page ? "btn-primary" : "btn-outline"}`}
              style={{
                width: "40px",
                height: "40px",
                padding: 0,
                borderRadius: "8px",
                cursor: page === "..." ? "default" : "pointer",
              }}
              disabled={page === "..."}
            >
              {page}
            </button>
          ))}

          {/* Nút Next */}
          <button
            className="btn btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <i className="material-icons" style={{ fontSize: "18px" }}>
              chevron_right
            </i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientProducts;
