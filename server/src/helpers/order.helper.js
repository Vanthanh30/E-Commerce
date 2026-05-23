import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { nextInvoiceId } from "./id.helper.js";

export async function createSingleItemOrder({
  customerId,
  productId,
  quantity,
  price,
  address,
  paymentMethod = 0,
  status = 1
}) {
  const orderId = await nextInvoiceId(Order, customerId);

  const order = await Order.create({
    orderId,
    customerId,
    saleDate: new Date(),
    paymentMethod,
    status,
    shippingAddress: address || "",
    items: [
      {
        productId,
        quantity: Number(quantity || 1),
        salePrice: Number(price || 0)
      }
    ]
  });

  await Product.updateOne(
    { productId },
    { $inc: { stock: -Math.max(0, Number(quantity || 1)) } }
  );
  await Product.updateOne(
    { productId, stock: { $lt: 0 } },
    { $set: { stock: 0 } }
  );

  return order;
}
