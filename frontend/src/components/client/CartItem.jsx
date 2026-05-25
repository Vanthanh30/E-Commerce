import React from "react";
import { assetUrl, currency } from "../../utils/formatters";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="cart-item-row">
      <img
        src={assetUrl(item.imageUrl || item.image)}
        alt={item.name}
        className="cart-item-image"
      />

      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <span className="cart-item-price">
          {currency(item.fixedPrice || item.price)}
        </span>
      </div>

      <div className="quantity-control">
        <button
          className="quantity-btn"
          onClick={() => onUpdateQuantity(item.productId, item.quantity, -1)}
        >
          -
        </button>
        <div className="quantity-value">{item.quantity}</div>
        <button
          className="quantity-btn"
          onClick={() => onUpdateQuantity(item.productId, item.quantity, 1)}
        >
          +
        </button>
      </div>

      <button
        className="remove-item-btn"
        onClick={() => onRemove(item.productId)}
        title="Xóa khỏi giỏ"
      >
        <i className="material-icons">delete_outline</i>
      </button>
    </div>
  );
};

export default CartItem;
