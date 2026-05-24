import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../../services/client/productService";
import ProductCard from "../../../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setProducts(response.data || response || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Đang tải...</div>
    );

  return (
    <>
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
          <p className="hero-desc">Trải nghiệm mô hình thương lượng độc bản.</p>
          <div className="hero-actions">
            <a href="#products" className="btn btn-primary">
              Khám phá ngay
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
            alt="Nội thất Atelier"
          />
          <div className="hero-visual-badge">2024 COLLECTION</div>
        </div>
      </div>

      <div id="products" className="page-container">
        <div style={{ marginBottom: "32px" }}>
          <h2 className="section-title">Sản phẩm tuyển chọn</h2>
        </div>
        <div className="product-layout">
          {products.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
