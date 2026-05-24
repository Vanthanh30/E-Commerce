import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productService } from "../../../services/product.service";
import { cartService } from "../../../services/client/cart.service";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl, currency } from "../../../utils/formatters";
import styles from "./Home.module.css";

const fallbackProducts = [
  { productId: "1", name: "Sofa Modular Velvet", fixedPrice: 28000000, description: "Sofa cao cấp bọc nỉ êm ái", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80" },
  { productId: "2", name: "Ghế ăn bọc nỉ", fixedPrice: 1500000, description: "Ghế ăn hiện đại, sang trọng", imageUrl: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=400&q=80" },
  { productId: "3", name: "Bàn làm việc Nordic", fixedPrice: 3200000, description: "Gỗ thông tự nhiên 100%", imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80" },
  { productId: "4", name: "Đèn chùm pha lê", fixedPrice: 8500000, description: "Thiết kế tân cổ điển", imageUrl: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=80" },
];

const fallbackImage = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";

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
      await cartService.addToCart({ customerId: user.customerId, productId: product.productId, quantity: 1 });
      alert("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (error) {
      alert(error.message || "Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroSubtitle}>ATELIER ACCORD</div>
          <h1>
            Đối thoại
            <br />
            qua <span className={styles.heroAccent}>Nội thất</span>
          </h1>
          <p className={styles.heroDesc}>
            Nơi mỗi món đồ nội thất không chỉ là vật dụng, mà là một cuộc hội
            thoại tinh tế về phong cách và giá trị. Trải nghiệm mô hình thương lượng độc bản.
          </p>
          <div className={styles.heroActions}>
            <a href="#products" className={styles.btnPrimary}>Khám phá ngay</a>
            <Link to="/negotiation-history" className={styles.btnOutline}>Xem bộ sưu tập</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
            alt="Nội thất Atelier"
          />
          <div className={styles.heroQuote}>
            &quot;Thương lượng là nghệ thuật - mỗi món đồ kể một câu chuyện về giá trị.&quot;
          </div>
        </div>
      </div>

      {/* ── Section header ── */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Danh mục tuyển chọn</h2>
        <div className={styles.sectionMeta}>BỘ SƯU TẬP {new Date().getFullYear()}</div>
      </div>

      {/* ── Category grid ── */}
      <div className={styles.categoryGrid}>
        <div className={`${styles.categoryCard} ${styles.cat1}`}>
          <div className={styles.categoryContent}>
            <h3>Bàn ăn & Phòng khách</h3>
            <p>Kiến tạo không gian sum vầy với những thiết kế trường tồn.</p>
          </div>
        </div>
        <div className={`${styles.categoryCard} ${styles.cat2}`}>
          <div className={styles.categoryContent}>
            <h3>Đèn trang trí</h3>
            <p>32 SẢN PHẨM</p>
          </div>
        </div>
        <div className={`${styles.categoryCard} ${styles.cat3}`}>
          <div className={styles.categoryContent}>
            <h3>Ghế Sofa</h3>
            <p>18 SẢN PHẨM</p>
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <div className={styles.sectionHeader} id="products">
        <h2 className={styles.sectionTitle}>Xu hướng thịnh hành</h2>
      </div>

      <div className={styles.productsGrid}>
        {displayProducts.map((item, index) => (
          <div
            key={item.productId}
            className={styles.productCard}
            onClick={() => navigate(`/product/${item.productId}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => { if (event.key === "Enter") navigate(`/product/${item.productId}`); }}
          >
            <div className={styles.productImageContainer}>
              {index === 0 && <span className={styles.productBadge}>NEW</span>}
              {index === 3 && <span className={styles.productBadge} style={{ background: "var(--danger)" }}>SALE</span>}
              <img
                src={assetUrl(item.imageUrl) || fallbackImage}
                alt={item.name}
                className={styles.productImg}
                onError={(event) => { event.currentTarget.src = fallbackImage; }}
              />
              <div className={styles.productActions}>
                <button type="button" className={styles.actionBtnPrimary} onClick={(e) => handleBuyNow(e, item)}>Mua ngay</button>
                <button type="button" className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); navigate(`/negotiate/${item.productId}`); }}>Trả giá</button>
                <button type="button" className={styles.actionBtn} onClick={(e) => handleAddToCart(e, item)}>Giỏ hàng</button>
              </div>
            </div>
            <div className={styles.productInfo}>
              <div className={styles.productName}>{item.name}</div>
              <div className={styles.productDesc}>{item.description || "Thiết kế hiện đại, tinh tế"}</div>
              <div className={styles.productPrice}>{item.fixedPrice ? currency(item.fixedPrice) : "Liên hệ"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Deal section ── */}
      <div className={styles.dealSection}>
        <div className={styles.dealContent}>
          <div className={styles.dealTag}>
            <i className="material-icons" style={{ fontSize: "16px" }}>local_offer</i>
            SÀN THƯƠNG LƯỢNG ĐẶC BIỆT
          </div>
          <h2 className={styles.dealTitle}>
            Mức giá nằm trong<br />
            <span>tầm tay của bạn</span>
          </h2>
          <p className={styles.dealDesc}>
            Tại Atelier Accord, chúng tôi tin rằng giá trị là một cuộc hội thoại.
            Hãy đưa ra mức giá bạn mong muốn cho các sản phẩm tuyển chọn.
          </p>
          <div className={styles.dealBox}>
            <div className={styles.dealProductMini}>
              <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=100&q=80" alt="Sofa Modular Velvet" />
              <div>
                <div className={styles.dealProductName}>Sofa Modular Velvet</div>
                <div className={styles.dealProductPrice}>Giá niêm yết: 28.000.000đ</div>
              </div>
            </div>
            <div className={styles.dealInputGroup}>
              <input type="text" placeholder="Nhập mức giá của bạn..." />
              <button type="button" className={styles.btnPrimary}>Deal</button>
            </div>
          </div>
        </div>
        <div className={styles.dealImage} />
      </div>
    </>
  );
};