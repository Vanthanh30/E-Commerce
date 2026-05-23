import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api"; // Giả sử bạn đã có file api.js lõi
import { currency } from "../../utils/formatters";

export const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Gọi API từ backend Node.js (cổng 4000) thay vì truy vấn trực tiếp DB
    const fetchProducts = async () => {
      try {
        const data = await api.get("/api/products");
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-subtitle">ATELIER ACCORD</div>
          <h1>
            Đối thoại
            <br />
            qua{" "}
            <span style={{ color: "var(--primary)", fontStyle: "italic" }}>
              Nội thất
            </span>
          </h1>
          <p className="hero-desc">
            Nơi mỗi món đồ nội thất không chỉ là vật dụng, mà là một cuộc hội
            thoại tinh tế về phong cách và giá trị.
          </p>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
            alt="Nội thất"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="section-header" id="products">
        <h2 className="section-title">Xu hướng thịnh hành</h2>
      </div>

      <div className="products-grid">
        {products.map((item, index) => (
          <div
            key={item.productId}
            className="product-card"
            onClick={() => navigate(`/product/${item.productId}`)}
          >
            <div className="product-image-container">
              {index === 0 && <span className="product-badge">NEW</span>}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="product-img"
              />
              <div className="product-actions">
                <button
                  className="action-btn primary"
                  onClick={(e) => {
                    e.stopPropagation(); /* Logic mua ngay */
                  }}
                >
                  Mua ngay
                </button>
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation(); /* Logic trả giá */
                  }}
                >
                  Trả giá
                </button>
              </div>
            </div>
            <div className="product-info">
              <div className="product-name">{item.name}</div>
              <div className="product-desc">{item.description}</div>
              <div className="product-price">{currency(item.fixedPrice)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
