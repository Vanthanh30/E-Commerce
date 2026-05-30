import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../../services/client/productService";
import { cartService } from "../../../services/client/cartService";
import { assetUrl, currency } from "../../../utils/formatters";
import "./product-detail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getById(id);
        setProduct(response.data || response);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return navigate("/login");

    const user = JSON.parse(userStr);
    const requestedQuantity = Math.floor(Number(quantity));
    if (!requestedQuantity || requestedQuantity < 1) {
      alert("Vui lòng chọn số lượng hợp lệ.");
      return;
    }
    if (requestedQuantity > Number(product.stock || 0)) {
      alert(`Số lượng tối đa hiện có là ${product.stock}.`);
      return;
    }

    setAddingToCart(true);

    try {
      await cartService.addToCart({
        customerId: user.customerId,
        productId: product.productId,
        quantity: requestedQuantity,
      });
      alert("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (err) {
      alert(err.message || "Lỗi khi thêm vào giỏ hàng.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBargain = () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return navigate("/login");

    navigate(`/bargains?product=${product.productId}`);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>Đang tải...</div>
    );
  if (!product)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        Sản phẩm không tồn tại.
      </div>
    );

  return (
    <div className="product-detail-container page-container">
      {/* NÚT QUAY LẠI THÔNG MINH */}
      <button className="back-btn-detail" onClick={() => navigate(-1)}>
        <i className="material-icons" style={{ fontSize: "18px" }}>
          arrow_back
        </i>
        Quay lại bộ sưu tập
      </button>

      <div className="product-detail-grid">
        <div className="product-image-gallery">
          <img src={assetUrl(product.imageUrl)} alt={product.name} />
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          <div className="product-price-large">
            {currency(product.fixedPrice)}
          </div>
          <div className="product-description">
            {product.description || "Chưa có mô tả."}
          </div>

          <div className="action-group">
            <div className="product-quantity-control">
              <button
                type="button"
                className="quantity-btn"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={product.stock || 1}
                value={quantity}
                onChange={(event) => {
                  const next = Math.floor(Number(event.target.value || 1));
                  setQuantity(Math.min(Math.max(next, 1), product.stock || 1));
                }}
              />
              <button
                type="button"
                className="quantity-btn"
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(value + 1, product.stock || 1),
                  )
                }
                disabled={quantity >= Number(product.stock || 0)}
              >
                +
              </button>
            </div>

            <div className="action-row">
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock <= 0}
              >
                {addingToCart ? "Đang xử lý..." : "Thêm vào giỏ"}
              </button>
              <button className="btn btn-outline" onClick={handleBargain}>
                Đề xuất giá
              </button>
            </div>
          </div>

          <div
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginTop: "20px",
            }}
          >
            <p>
              <i
                className="material-icons"
                style={{
                  fontSize: "16px",
                  verticalAlign: "middle",
                  marginRight: "6px",
                }}
              >
                inventory_2
              </i>{" "}
              Tình trạng:{" "}
              <strong>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
