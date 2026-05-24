import React from "react";
import { assetUrl, currency } from "../utils/formatters";

const CheckoutItem = ({ item }) => {
  return (
    <div className="checkout-item-row">
      <img
        src={assetUrl(item.imageUrl || item.image)}
        alt={item.productName || item.name}
        className="checkout-item-img"
      />
      <div className="checkout-item-info">
        <h4>{item.productName || item.name}</h4>
        <p>Số lượng: {item.quantity}</p>
      </div>
      <div className="checkout-item-price">
        {currency((item.fixedPrice || item.price || 0) * item.quantity)}
      </div>
    </div>
  );
};

export default CheckoutItem;
