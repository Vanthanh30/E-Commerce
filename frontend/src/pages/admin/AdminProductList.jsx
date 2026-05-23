// src/pages/admin/AdminProductList.jsx
import React, { useState, useEffect } from "react";
import { productService } from "../../services/product.service";
import { currency } from "../../utils/formatters";

export const AdminProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllForAdmin();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="page-title">Quản lý Sản phẩm</h1>
        <button className="btn btn-primary">+ Thêm sản phẩm</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá cố định</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => (
            <tr key={item.productId} style={{ cursor: "pointer" }}>
              <td>
                <div className="table-product">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <small
                      style={{ display: "block", color: "var(--text-muted)" }}
                    >
                      SKU: {item.productId}
                    </small>
                  </div>
                </div>
              </td>
              <td>{item.categoryName}</td>
              <td>{currency(item.fixedPrice)}</td>
              <td>{item.stock}</td>
              <td>
                {item.stock > 0 ? (
                  <span className="status-pill in-stock">Còn hàng</span>
                ) : (
                  <span className="status-pill out-stock">Hết hàng</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
