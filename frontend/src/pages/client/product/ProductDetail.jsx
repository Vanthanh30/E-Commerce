import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productService } from "../../../services/product.service";
import { cartService } from "../../../services/client/cart.service";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl, currency } from "../../../utils/formatters";
import styles from "./ProductDetail.module.css";

const mockProduct = {
  productId: "1",
  name: "Atelier Signature Sofa",
  fixedPrice: 45000000,
  description: "Thiết kế tinh tế kết hợp chất liệu cao cấp, tạo điểm nhấn cho phòng khách hiện đại.",
  imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  stock: 3,
};

function normalizeProduct(item) {
  return {
    productId: item.productId || item.idSP,
    name: item.name || item.tenSanPham,
    fixedPrice: item.fixedPrice ?? item.giaCoDinh,
    description: item.description || item.moTa,
    imageUrl: item.imageUrl || item.hinhAnh,
    stock: item.stock ?? item.SoLuongCon ?? 0,
  };
}

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const data = await productService.getDetail(id);
        const normalized = normalizeProduct(data);
        setProduct(normalized);
        setMainImage(assetUrl(normalized.imageUrl));
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        const normalized = normalizeProduct(mockProduct);
        setProduct(normalized);
        setMainImage(assetUrl(normalized.imageUrl));
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  const thumbnails = useMemo(() => {
    if (!product) return [];
    return [
      assetUrl(product.imageUrl),
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200",
    ].filter(Boolean);
  }, [product]);

  const handleBuyNow = () => {
    if (!product) return;
    navigate("/checkout", { state: { product, quantity: 1 } });
  };

  const handleAddToCart = async () => {
    if (!user?.customerId) {
      alert("Vui lòng đăng nhập để sử dụng giỏ hàng.");
      navigate("/login");
      return;
    }
    try {
      await cartService.addToCart({ customerId: user.customerId, productId: product.productId, quantity: 1 });
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      alert(error.message || "Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  if (loading) return <div className={styles.stateMessage}>Đang tải bộ sưu tập...</div>;
  if (!product) return <div className={styles.stateMessage}>Không tìm thấy món đồ nội thất yêu cầu.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.breadcrumb}>
        <Link to="/">Trang chủ</Link> &gt; <Link to="/">Phòng khách</Link> &gt; {product.name}
      </div>

      <div className={styles.productLayout}>
        {/* ── Gallery ── */}
        <div>
          <div className={styles.galleryMain}>
            <img src={mainImage} alt={product.name} />
          </div>
          <div className={styles.galleryThumbs}>
            {thumbnails.map((thumbUrl) => (
              <img
                key={thumbUrl}
                src={thumbUrl}
                alt=""
                className={mainImage === thumbUrl ? styles.active : ""}
                onClick={() => setMainImage(thumbUrl)}
              />
            ))}
          </div>
        </div>

        {/* ── Info ── */}
        <div>
          <div className={styles.productBadges}>
            <span className={styles.badgeGold}>Phiên bản giới hạn</span>
            <span className={styles.badgeStock}>
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          <h1 className={styles.pageTitle}>{product.name}</h1>
          <p className={styles.pageSubtitle}>Thiết kế bởi Studio Editorial</p>

          <div className={styles.priceBox}>
            <div className={styles.priceLabel}>Giá cố định</div>
            <div className={styles.priceValue}>
              {product.fixedPrice ? currency(product.fixedPrice) : "Liên hệ"}
            </div>
          </div>

          <button type="button" onClick={handleBuyNow} className={styles.btnPrimary}>
            <i className="material-icons" style={{ fontSize: "18px" }}>shopping_bag</i>
            Mua ngay
          </button>

          <div className={styles.negotiateBox}>
            <strong>Đề xuất giá</strong>
            <p className={styles.negotiateDesc}>
              Đưa ra mức giá bạn mong muốn - hệ thống sẽ phản hồi qua quy trình thương lượng.
            </p>
            <Link to={`/negotiate/${product.productId}`} className={styles.btnOutline}>
              Đề xuất giá mới
            </Link>
          </div>

          <div className={styles.specsGrid}>
            <div className={styles.specItem}>
              <label>Chất liệu</label> Nhung Ý & gỗ sồi tự nhiên
            </div>
            <div className={styles.specItem}>
              <label>Kích thước</label> 240x100x85 cm
            </div>
          </div>

          <h3 className={styles.descTitle}>Mô tả sản phẩm</h3>
          <p className={styles.descText}>
            {product.description || "Sản phẩm tuyển chọn từ bộ sưu tập Atelier Accord."}
          </p>

          <button type="button" onClick={handleAddToCart} className={styles.btnGhost}>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};