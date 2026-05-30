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

  if (!customerId || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "Invalid order data" });
    return;
  }

  const cleanAddress = String(address || shippingAddress || "").trim();
  if (!cleanAddress) {
    res.status(400).json({ message: "Shipping address is required" });
    return;
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ productId: { $in: productIds } });
  const productMap = new Map(products.map((item) => [item.productId, item]));
  const orderItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    const quantity = Math.floor(Number(item.quantity || 0));
    const salePrice = Number(item.price || 0);

    if (!product) {
      res.status(404).json({ message: `Product ${item.productId} not found` });
      return;
    }

    if (!quantity || quantity < 1 || !Number.isFinite(salePrice) || salePrice <= 0) {
      res.status(400).json({ message: "Invalid order item" });
      return;
    }

    if (Number(product.stock || 0) < quantity) {
      res.status(400).json({
        message: `Sản phẩm ${product.name} chỉ còn ${product.stock || 0}`,
      });
      return;
    }

    orderItems.push({
      productId: item.productId,
      quantity,
      salePrice,
    });
  }

  const orderId = "ORD-" + Date.now().toString().slice(-6);

  const order = await Order.create({
    orderId,
    customerId,
    shippingAddress: cleanAddress,
    paymentMethod: Number(paymentMethod || 0),
    status: Number(status || 1),
    items: orderItems,
  });

  await Promise.all(
    orderItems.map((item) =>
      Product.updateOne(
        { productId: item.productId },
        { $inc: { stock: -item.quantity } },
      ),
    ),
  );

  const cartItemIds = items.map((item) => item.cartItemId).filter(Boolean);
  if (cartItemIds.length > 0) {
    await CartItem.deleteMany({ customerId, _id: { $in: cartItemIds } });
  } else {
    await CartItem.deleteMany({
      customerId,
      productId: { $in: productIds },
    });
  }

  res.status(201).json({ orderId: order.orderId });
}

export async function updateOrderStatus(req, res) {
  const status = Number(req.body.status);
  if (![1, 2, 3, 4, 5].includes(status)) {
    res.status(400).json({ message: "Invalid order status" });
    return;
  }

  const existing = await Order.findOne({ orderId: req.params.id });

  if (!existing) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  const shouldRestoreStock = status === 5 && existing.status !== 5;

  existing.status = status;
  await existing.save();

  if (shouldRestoreStock) {
    await Promise.all(
      existing.items.map((item) =>
        Product.updateOne(
          { productId: item.productId },
          { $inc: { stock: item.quantity } },
        ),
      ),
    );
  }

  res.json({
    message: "Order status updated",
    statusText: orderStatus(status),
  });
}
