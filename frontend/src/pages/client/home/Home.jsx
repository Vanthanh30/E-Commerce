import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productService } from "../../../services/product.service";
import { cartService } from "../../../services/client/cart.service";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl, currency } from "../../../utils/formatters";

const fallbackProducts = [
  {
    productId: "1",
    name: "Sofa Modular Velvet",
    fixedPrice: 28000000,
    description: "Sofa cao cấp bọc nỉ êm ái",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
  },
  {
    productId: "2",
    name: "Ghế ăn bọc nỉ",
    fixedPrice: 1500000,
    description: "Ghế ăn hiện đại, sang trọng",
    imageUrl:
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=400&q=80",
  },
  {
    productId: "3",
    name: "Bàn làm việc Nordic",
    fixedPrice: 3200000,
    description: "Gỗ thông tự nhiên 100%",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80",
  },
  {
    productId: "4",
    name: "Đèn chùm pha lê",
    fixedPrice: 8500000,
    description: "Thiết kế tân cổ điển",
    imageUrl:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80",
  },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";

function normalizeProduct(item) {
  return {
    productId: item.productId || item.idSP,
    name: item.name || item.tenSanPham,
    fixedPrice: item.fixedPrice ?? item.giaCoDinh,
    description: item.description || item.moTa,
    imageUrl: item.imageUrl || item.hinhAnh,
  };
}

export const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllActive();
        setProducts(Array.isArray(data) ? data.map(normalizeProduct) : []);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
      }
    };

    fetchProducts();
  }, []);

  const displayProducts = useMemo(
    () => (products.length > 0 ? products : fallbackProducts),
    [products],
  );

  const handleBuyNow = (event, product) => {
    event.stopPropagation();
    navigate("/checkout", { state: { product, quantity: 1 } });
  };

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();
    if (!user?.customerId) {
      alert("Vui lòng đăng nhập để sử dụng giỏ hàng.");
      navigate("/login");
      return;
    }

    try {
      await cartService.addToCart({
        customerId: user.customerId,
        productId: product.productId,
        quantity: 1,
      });
      alert("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (error) {
      alert(error.message || "Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

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
          <p className="hero-desc">
            Nơi mỗi món đồ nội thất không chỉ là vật dụng, mà là một cuộc hội
            thoại tinh tế về phong cách và giá trị. Trải nghiệm mô hình thương
            lượng độc bản.
          </p>
          <div className="hero-actions">
            <a href="#products" className="btn btn-primary">
              Khám phá ngay
            </a>
            <Link to="/negotiation-history" className="btn btn-outline">
              Xem bộ sưu tập
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
            alt="Nội thất Atelier"
          />
          <div className="hero-quote">
            &quot;Thương lượng là nghệ thuật - mỗi món đồ kể một câu chuyện về
            giá trị.&quot;
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Danh mục tuyển chọn</h2>
        <div className="section-meta">BỘ SƯU TẬP {new Date().getFullYear()}</div>
      </div>

      <div className="category-grid">
        <div className="category-card cat-1">
          <div className="category-content">
            <h3>Bàn ăn & Phòng khách</h3>
            <p>Kiến tạo không gian sum vầy với những thiết kế trường tồn.</p>
          </div>
        </div>
        <div className="category-card cat-2">
          <div className="category-content">
            <h3>Đèn trang trí</h3>
            <p>32 SẢN PHẨM</p>
          </div>
        </div>
        <div className="category-card cat-3">
          <div className="category-content">
            <h3>Ghế Sofa</h3>
            <p>18 SẢN PHẨM</p>
          </div>
        </div>
      </div>

      <div className="section-header" id="products">
        <h2 className="section-title">Xu hướng thịnh hành</h2>
      </div>

      <div className="products-grid">
        {displayProducts.map((item, index) => (
          <div
            key={item.productId}
            className="product-card"
            onClick={() => navigate(`/product/${item.productId}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate(`/product/${item.productId}`);
            }}
          >
            <div className="product-image-container">
              {index === 0 && <span className="product-badge">NEW</span>}
              {index === 3 && (
                <span
                  className="product-badge"
                  style={{ background: "var(--danger)" }}
                >
                  SALE
                </span>
              )}
              <img
                src={assetUrl(item.imageUrl) || fallbackImage}
                alt={item.name}
                className="product-img"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />
              <div className="product-actions">
                <button
                  type="button"
                  className="action-btn primary"
                  onClick={(event) => handleBuyNow(event, item)}
                >
                  Mua ngay
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/negotiate/${item.productId}`);
                  }}
                >
                  Trả giá
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={(event) => handleAddToCart(event, item)}
                >
                  Giỏ hàng
                </button>
              </div>
            </div>
            <div className="product-info">
              <div className="product-name">{item.name}</div>
              <div className="product-desc">
                {item.description || "Thiết kế hiện đại, tinh tế"}
              </div>
              <div className="product-price">
                {item.fixedPrice ? currency(item.fixedPrice) : "Liên hệ"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="deal-section">
        <div className="deal-content">
          <div className="deal-tag">
            <i className="material-icons" style={{ fontSize: "16px" }}>
              local_offer
            </i>{" "}
            SÀN THƯƠNG LƯỢNG ĐẶC BIỆT
          </div>
          <h2 className="deal-title">
            Mức giá nằm trong
            <br />
            <span>tầm tay của bạn</span>
          </h2>
          <p className="deal-desc">
            Tại Atelier Accord, chúng tôi tin rằng giá trị là một cuộc hội
            thoại. Hãy đưa ra mức giá bạn mong muốn cho các sản phẩm tuyển chọn.
          </p>
          <div className="deal-box">
            <div className="deal-product-mini">
              <img
                src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=100&q=80"
                alt="Sofa Modular Velvet"
              />
              <div>
                <div style={{ fontWeight: 500, fontSize: "14px" }}>
                  Sofa Modular Velvet
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Giá niêm yết: 28.000.000đ
                </div>
              </div>
            </div>
            <div className="deal-input-group">
              <input type="text" placeholder="Nhập mức giá của bạn..." />
              <button type="button" className="btn btn-primary">
                Deal
              </button>
            </div>
          </div>
        </div>
        <div className="deal-image"></div>
      </div>
    </>
  );
};
