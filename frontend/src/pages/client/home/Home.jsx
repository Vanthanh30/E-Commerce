import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../../../services/client/productService";
import ProductCard from "../../../components/client/ProductCard"; // Đường dẫn tuỳ thuộc folder của bạn
import "./home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        // Lấy tối đa 4-8 sản phẩm để hiển thị ở mục "Thịnh hành" cho đẹp
        setProducts((response.data || response || []).slice(0, 4));
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
      <div style={{ textAlign: "center", padding: "100px" }}>
        Đang tải cửa hàng...
      </div>
    );

  return (
    <div className="page-container" style={{ paddingTop: "20px" }}>
      {/* 1. HERO SECTION */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-subtitle">ATELIER ACCORD</div>
          <h1>
            Đối thoại
            <br />
            qua <span style={{ color: "var(--primary)" }}>Nội thất</span>
          </h1>
          <p className="hero-desc">
            Khám phá sự giao thoa giữa nghệ thuật tạo hình và công năng thực
            dụng. Trải nghiệm mô hình thương lượng độc bản chỉ có tại Atelier.
          </p>
          <div className="hero-actions">
            <a href="#trending" className="btn btn-primary">
              Khám phá ngay
            </a>
          </div>
        </div>

        <div className="hero-visual">
          {/* Ảnh Sofa da đen sang trọng giống mockup */}
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
            alt="Atelier Accord Collection"
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

      {/* 2. CATEGORIES SECTION (DANH MỤC TUYỂN CHỌN) */}
      <div className="section-header">
        <h2 className="section-title">Danh mục tuyển chọn</h2>
        <Link to="/" className="section-link">
          Khám phá tất cả
        </Link>
      </div>

      <div className="category-grid">
        <Link
          to="/"
          className="category-card cat-large"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80')`,
          }}
        >
          <div className="category-content">
            <h3>Phòng ăn & Phòng khách</h3>
            <p>Không gian kết nối yêu thương gia đình</p>
          </div>
        </Link>

        <Link
          to="/"
          className="category-card cat-small"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80')`,
          }}
        >
          <div className="category-content">
            <h3>Đèn trang trí</h3>
            <p>24 sản phẩm</p>
          </div>
        </Link>

        <Link
          to="/"
          className="category-card cat-small"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80')`,
          }}
        >
          <div className="category-content">
            <h3>Ghế Sofa</h3>
            <p>18 sản phẩm</p>
          </div>
        </Link>

        <Link
          to="/"
          className="category-card cat-wide"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80')`,
          }}
        >
          <div className="category-content">
            <h3>Góc làm việc</h3>
            <p>Khơi nguồn cảm hứng sáng tạo mỗi ngày</p>
          </div>
        </Link>
      </div>

      {/* 3. TRENDING PRODUCTS (XU HƯỚNG THỊNH HÀNH) */}
      <div id="trending" className="section-header">
        <h2 className="section-title">Xu hướng thịnh hành</h2>
        <div className="nav-arrows">
          <button>
            <i className="material-icons" style={{ fontSize: "18px" }}>
              chevron_left
            </i>
          </button>
          <button>
            <i className="material-icons" style={{ fontSize: "18px" }}>
              chevron_right
            </i>
          </button>
        </div>
      </div>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((item) => (
            <ProductCard key={item.productId} item={item} />
          ))
        ) : (
          <p style={{ color: "var(--text-muted)" }}>Chưa có sản phẩm nào.</p>
        )}
      </div>

      {/* 4. DEAL BANNER (MỨC GIÁ TRONG TẦM TAY) */}
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
