import CartItem from "../models/cartItem.model.js";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { createSingleItemOrder } from "../helpers/order.helper.js";
import { orderStatus } from "../helpers/status.helper.js";

async function formatOrders(filter = {}) {
  const orders = await Order.find(filter)
    .sort({ saleDate: -1, orderId: -1 })
    .lean();
  const productIds = [
    ...new Set(
      orders.flatMap((order) => order.items.map((item) => item.productId)),
    ),
  ];
  const products = await Product.find({
    productId: { $in: productIds },
  }).lean();
  const productMap = new Map(products.map((item) => [item.productId, item]));

  return orders.map((order) => {
    let totalAmount = 0;

    const formattedItems = order.items.map((item) => {
      const product = productMap.get(item.productId) || {};
      totalAmount += item.salePrice * item.quantity;
      return {
        productId: item.productId,
        productName: product.name || "",
        imageUrl: product.imageUrl || "",
        quantity: item.quantity,
        price: item.salePrice,
      };
    });

    return {
      orderId: order.orderId,
      customerId: order.customerId,
      saleDate: order.saleDate,
      paymentMethod: order.paymentMethod,
      status: order.status,
      statusText: orderStatus(order.status),
      shippingAddress: order.shippingAddress,
      items: formattedItems,
      totalAmount: totalAmount,
    };
  });
}

export async function listOrders(req, res) {
  const filter = {};
  if (req.query.customerId) filter.customerId = req.query.customerId;
  if (req.query.status) filter.status = Number(req.query.status);
  res.json(await formatOrders(filter));
}

export async function getOrder(req, res) {
  const order = await Order.findOne({ orderId: req.params.id }).lean();
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  const [customer, products] = await Promise.all([
    Customer.findOne({ customerId: order.customerId }).lean(),
    Product.find({
      productId: { $in: order.items.map((item) => item.productId) },
    }).lean(),
  ]);
  const productMap = new Map(products.map((item) => [item.productId, item]));

  res.json({
    orderId: order.orderId,
    customerId: order.customerId,
    customerName: customer?.fullName || "",
    email: customer?.email || "",
    saleDate: order.saleDate,
    paymentMethod: order.paymentMethod,
    status: order.status,
    statusText: orderStatus(order.status),
    shippingAddress: order.shippingAddress,
    items: order.items.map((item) => {
      const product = productMap.get(item.productId) || {};
      return {
        productId: item.productId,
        productName: product.name || "",
        imageUrl: product.imageUrl || "",
        quantity: item.quantity,
        price: item.salePrice,
      };
    }),
  });
}

export async function createOrder(req, res) {
  const { customerId, address, shippingAddress, paymentMethod, status, items } =
    req.body;

  const orderId = "ORD-" + Date.now().toString().slice(-6);

  const orderItems = items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    salePrice: item.price,
  }));

  const order = await Order.create({
    orderId,
    customerId,
    shippingAddress: address || shippingAddress || "",
    paymentMethod: Number(paymentMethod || 0),
    status: Number(status || 1),
    items: orderItems,
  });

  const productIdsToClear = items.map((item) => item.productId);
  await CartItem.deleteMany({
    customerId: customerId,
    productId: { $in: productIdsToClear },
  });

  res.status(201).json({ orderId: order.orderId });
}

export async function updateOrderStatus(req, res) {
  const status = Number(req.body.status);
  if (![1, 2, 3, 4, 5].includes(status)) {
    res.status(400).json({ message: "Invalid order status" });
    return;
  }

  const order = await Order.findOneAndUpdate(
    { orderId: req.params.id },
    { $set: { status } },
    { returnDocument: "after" },
  ).lean();

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json({
    message: "Order status updated",
    statusText: orderStatus(status),
  });
}
