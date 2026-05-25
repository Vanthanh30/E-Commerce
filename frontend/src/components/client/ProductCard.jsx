import React from "react";
import { Link } from "react-router-dom";
import { assetUrl, currency } from "../../utils/formatters";

const ProductCard = ({ item }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${item.productId}`}>
        <div className="product-image-container">
          <img
            src={assetUrl(item.imageUrl || item.hinhAnh)}
            alt={item.name}
            className="product-img"
          />
          <button className="favorite-btn" onClick={(e) => e.preventDefault()}>
            <i className="material-icons" style={{ fontSize: "18px" }}>
              favorite_border
            </i>
          </button>
        </div>
      </Link>
      <div className="product-info">
        <h3 className="product-name">{item.name}</h3>
        <div className="product-desc">
          {item.description || "Thiết kế hiện đại, tinh tế"}
        </div>
        <div className="product-price">{currency(item.fixedPrice)}</div>
      </div>
    </div>
  );
};

export default ProductCard;
