import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../../services/client/productService";
import { categoryService } from "../../../services/client/categoryService";
import ProductCard from "../../../components/client/ProductCard";
import "./home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
        ]);
        setProducts(prodRes.data || prodRes || []);
        setCategories(catRes.data || catRes || []);
      } catch (err) {
        console.error("Lỗi tải trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const visibleProducts = products.slice(currentIndex, currentIndex + 4);
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex + 4 >= products.length;

  const handleNext = () => {
    if (!isNextDisabled) setCurrentIndex((prev) => prev + 4);
  };
  const handlePrev = () => {
    if (!isPrevDisabled) setCurrentIndex((prev) => prev - 4);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>Đang tải...</div>
    );

  return (
    <div className="page-container" style={{ paddingTop: "20px" }}>
      {/* 1. HERO SECTION */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-subtitle">ATELIER ACCORD</div>
          <h1>
            Đối thoại <br /> qua{" "}
            <span style={{ color: "var(--primary)" }}>Nội thất</span>
          </h1>
          <p className="hero-desc">
            Khám phá sự giao thoa giữa nghệ thuật tạo hình và công năng thực
            dụng. Trải nghiệm mô hình thương lượng độc bản chỉ có tại Atelier.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Khám phá ngay
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
            alt="Atelier Accord"
          />
          <div className="hero-visual-card">
            <h4>Hơi thở đương đại</h4>
            <p>
              Bộ sưu tập 2024 đánh dấu sự chuyển mình trong phong cách thiết kế
              tối giản.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY GRID */}
      <div className="section-header">
        <h2 className="section-title">Danh mục tuyển chọn</h2>
        <Link to="/products" className="section-link">
          Khám phá tất cả
        </Link>
      </div>
      <div className="category-grid">
        {categories.map((cat, index) => (
          <Link
            key={cat.categoryId}
            to={`/products?categoryId=${cat.categoryId}`}
            className={`category-card ${index === 0 ? "cat-large" : index < 3 ? "cat-small" : "cat-wide"}`}
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80')`,
            }}
          >
            <div className="category-content">
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 3. TRENDING PRODUCTS */}
      <div id="trending" className="section-header">
        <h2 className="section-title">Xu hướng thịnh hành</h2>
        <div className="nav-arrows">
          <button onClick={handlePrev} disabled={isPrevDisabled}>
            <i className="material-icons">chevron_left</i>
          </button>
          <button onClick={handleNext} disabled={isNextDisabled}>
            <i className="material-icons">chevron_right</i>
          </button>
        </div>
      </div>
      <div className="products-grid">
        {visibleProducts.map((item) => (
          <ProductCard key={item.productId} item={item} />
        ))}
      </div>

      {/* 4. DEAL BANNER (ĐÃ PHỤC HỒI) */}
      <div className="deal-section">
        <div className="deal-content">
          <div className="deal-tag">
            <i className="material-icons" style={{ fontSize: "16px" }}>
              sell
            </i>
            GIÁ THƯƠNG LƯỢNG - ĐỘC QUYỀN ATELIER
          </div>
          <h2 className="deal-title">
            Mức giá nằm trong
            <br />
            <span>tầm tay của bạn</span>
          </h2>
          <p className="deal-desc">
            Tại Atelier Accord, chúng tôi tin rằng giá trị thực sự của một kiệt
            tác nội thất được định đoạt bởi sự đồng điệu giữa người chế tác và
            người cảm thụ. Hãy tự tin đề xuất mức giá bạn mong muốn.
          </p>
          <div className="deal-input-box">
            <p>Gửi yêu cầu thiết kế / báo giá riêng:</p>
            <form className="deal-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập email hoặc số điện thoại..."
              />
              <button type="submit" className="btn btn-primary">
                Gửi đi
              </button>
            </form>
          </div>
        </div>
        <div
          className="deal-image"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80')`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default Home;
