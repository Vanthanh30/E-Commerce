// src/pages/client/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import { cartService } from "../../services/client/cart.service";
import { useAuth } from "../../context/AuthContext";
import { currency } from "../../utils/formatters";

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
        setProduct(data);
        setMainImage(data.imageUrl); // Đặt ảnh đại diện mặc định ban đầu
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err);
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng giỏ hàng");
      return navigate("/login");
    }
    try {
      await cartService.addToCart({
        customerId: user.customerId,
        productId: product.productId,
        quantity: 1,
      });
      alert("Đã thêm tác phẩm vào giỏ hàng thành công!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return <div className="page-container">Đang tải bộ sưu tập...</div>;
  if (!product)
    return (
      <div className="page-container">
        Không tìm thấy món đồ nội thất yêu cầu.
      </div>
    );

  // Giả lập danh sách thumbnail dựa trên ảnh chính để đồng bộ hệ thống layout cũ
  const thumbnails = [
    product.imageUrl,
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200",
  ];

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> › Phòng khách › {product.name}
      </div>

      <div className="product-layout">
        <div>
          <div className="product-gallery-main">
            <img src={mainImage} alt={product.name} />
          </div>
          <div className="product-gallery-thumbs">
            {thumbnails.map((thumbUrl, idx) => (
              <img
                key={idx}
                src={thumbUrl}
                className={mainImage === thumbUrl ? "active" : ""}
                onClick={() => setMainImage(thumbUrl)} // Tích hợp trực tiếp logic đổi ảnh của atelier.js
                alt="Bộ sưu tập góc cạnh"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="product-badges">
            <span className="badge badge-gold">Phiên bản tuyển chọn</span>
            <span className="badge badge-stock">
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">Thiết kế bởi Studio Editorial</p>

          <div className="price-box">
            <div className="price-label">Giá cố định</div>
            <div className="price-value">{currency(product.fixedPrice)}</div>
          </div>

          <button
            onClick={() => navigate(`/order-now`, { state: { product } })}
            className="btn btn-primary btn-block"
            style={{ marginBottom: "12px" }}
          >
            <i className="material-icons" style={{ fontSize: "18px" }}>
              shopping_bag
            </i>{" "}
            Mua ngay
          </button>

          <div className="negotiate-box">
            <strong>Đề xuất giá (Mặc cả)</strong>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                margin: "8px 0 12px",
              }}
            >
              Đưa ra mức giá bạn mong muốn — hệ thống sẽ phản hồi qua quy trình
              thương lượng tối đa 3 vòng.
            </p>
            <Link
              to={`/negotiate/${product.productId}`}
              className="btn btn-outline btn-block"
            >
              Đề xuất giá mới
            </Link>
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
                "Sản phẩm tuyển chọn đặc biệt từ Atelier Accord."}
            </p>
          </div>

          <button
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
