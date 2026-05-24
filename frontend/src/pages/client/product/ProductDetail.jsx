import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productService } from "../../../services/product.service";
import { cartService } from "../../../services/client/cart.service";
import { useAuth } from "../../../context/AuthContext";
import { assetUrl, currency } from "../../../utils/formatters";

const mockProduct = {
  productId: "1",
  name: "Atelier Signature Sofa",
  fixedPrice: 45000000,
  description:
    "Thiết kế tinh tế kết hợp chất liệu cao cấp, tạo điểm nhấn cho phòng khách hiện đại.",
  imageUrl:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
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
      await cartService.addToCart({
        customerId: user.customerId,
        productId: product.productId,
        quantity: 1,
      });
      alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
    } catch (error) {
      alert(error.message || "Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  if (loading) {
    return <div className="page-container">Đang tải bộ sưu tập...</div>;
  }

  if (!product) {
    return (
      <div className="page-container">
        Không tìm thấy món đồ nội thất yêu cầu.
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> &gt; <Link to="/">Phòng khách</Link> &gt;{" "}
        {product.name}
      </div>

      <div className="product-layout">
        <div>
          <div className="product-gallery-main">
            <img src={mainImage} alt={product.name} />
          </div>
          <div className="product-gallery-thumbs">
            {thumbnails.map((thumbUrl) => (
              <img
                key={thumbUrl}
                src={thumbUrl}
                alt=""
                className={mainImage === thumbUrl ? "active" : ""}
                onClick={() => setMainImage(thumbUrl)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="product-badges">
            <span className="badge badge-gold">Phiên bản giới hạn</span>
            <span className="badge badge-stock">
              {product.stock > 0
                ? `Còn ${product.stock} sản phẩm`
                : "Hết hàng"}
            </span>
          </div>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">Thiết kế bởi Studio Editorial</p>

          <div className="price-box">
            <div className="price-label">Giá cố định</div>
            <div className="price-value">
              {product.fixedPrice ? currency(product.fixedPrice) : "Liên hệ"}
            </div>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="btn btn-primary btn-block"
            style={{ marginBottom: "12px" }}
          >
            <i className="material-icons" style={{ fontSize: "18px" }}>
              shopping_bag
            </i>{" "}
            Mua ngay
          </button>

          <div className="negotiate-box">
            <strong>Đề xuất giá</strong>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                margin: "8px 0 12px",
              }}
            >
              Đưa ra mức giá bạn mong muốn - hệ thống sẽ phản hồi qua quy trình
              thương lượng.
            </p>
            <Link
              to={`/negotiate/${product.productId}`}
              className="btn btn-outline btn-block"
            >
              Đề xuất giá mới
            </Link>
          </div>

          <div className="specs-grid">
            <div className="spec-item">
              <label>Chất liệu</label> Nhung Ý & gỗ sồi tự nhiên
            </div>
            <div className="spec-item">
              <label>Kích thước</label> 240x100x85 cm
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Mô tả sản phẩm
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {product.description ||
                "Sản phẩm tuyển chọn từ bộ sưu tập Atelier Accord."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="btn btn-ghost btn-block"
            style={{ marginTop: "16px" }}
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};
