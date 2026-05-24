import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../../../services/client/productService";
import { cartService } from "../../../services/client/cartService";
import { bargainService } from "../../../services/client/bargainService";
import { assetUrl, currency } from "../../../utils/formatters";
import "./product-detail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [addingToCart, setAddingToCart] = useState(false);
  const [showBargain, setShowBargain] = useState(false);
  const [proposedPrice, setProposedPrice] = useState("");
  const [bargaining, setBargaining] = useState(false);

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

    const user = JSON.parse(userStr); // Lấy thông tin user để trích xuất customerId
    setAddingToCart(true);

    try {
      await cartService.addToCart({
        customerId: user.customerId, // Bổ sung bắt buộc
        productId: product.productId, // Đổi từ _id thành productId
        quantity: 1,
      });
      alert("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (err) {
      alert(err.message || "Lỗi khi thêm vào giỏ hàng.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBargainSubmit = async (e) => {
    e.preventDefault();
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return navigate("/login");

    const user = JSON.parse(userStr);
    setBargaining(true);

    try {
      await bargainService.create({
        customerId: user.customerId, // Bổ sung bắt buộc
        productId: product.productId, // Đổi từ _id thành productId
        price: Number(proposedPrice), // BE của bạn nhận biến là 'price', không phải 'proposedPrice'
        quantity: 1, // Bổ sung số lượng mặc định
        note: "",
      });
      alert("Đề xuất giá thành công!");
      setShowBargain(false);
      setProposedPrice("");
    } catch (err) {
      alert(err.message || "Lỗi khi gửi đề xuất.");
    } finally {
      setBargaining(false);
    }
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
            <div className="action-row">
              <button
                className="btn btn-primary"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? "Đang xử lý..." : "Thêm vào giỏ"}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShowBargain(!showBargain)}
              >
                Đề xuất giá
              </button>
            </div>

            {showBargain && (
              <div className="bargain-box">
                <h3>Gửi đề xuất giá</h3>
                <form className="bargain-form" onSubmit={handleBargainSubmit}>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Mức giá (VNĐ)"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    min={product.minPrice || 1000} // Ngăn chặn trả giá thấp hơn minPrice nếu có
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={bargaining}
                  >
                    {bargaining ? "Đang gửi..." : "Gửi"}
                  </button>
                </form>
              </div>
            )}
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
