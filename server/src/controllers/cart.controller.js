import CartItem from "../models/cartItem.model.js";
import Product from "../models/product.model.js";

async function getCartItems(customerId) {
  const cart = await CartItem.find({ customerId }).sort({ updatedAt: -1 }).lean();
  const productIds = cart.map((item) => item.productId);
  const products = await Product.find({ productId: { $in: productIds } }).lean();
  const productMap = new Map(products.map((item) => [item.productId, item]));

  return cart.map((item) => {
    const product = productMap.get(item.productId) || {};
    return {
      customerId: item.customerId,
      productId: item.productId,
      quantity: item.quantity,
      productName: product.name || "",
      price: product.fixedPrice || 0,
      imageUrl: product.imageUrl || "",
      stock: product.stock || 0,
      total: Number(product.fixedPrice || 0) * Number(item.quantity || 0)
    };
  });
}

export async function listCart(req, res) {
  res.json(await getCartItems(req.params.customerId));
}

export async function addToCart(req, res) {
  const customerId = req.body.customerId;
  const productId = req.body.productId;
  const quantity = Number(req.body.quantity || 1);
  const product = await Product.findOne({ productId, status: 1 }).lean();

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const existing = await CartItem.findOne({ customerId, productId });
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock || existing.quantity + quantity);
    await existing.save();
  } else {
    await CartItem.create({
      customerId,
      productId,
      quantity: Math.min(quantity, product.stock || quantity)
    });
  }

  res.status(201).json(await getCartItems(customerId));
}

export async function updateCartItem(req, res) {
  const product = await Product.findOne({ productId: req.params.productId }).lean();
  const quantity = Math.min(
    Math.max(1, Number(req.body.quantity || 1)),
    Number(product?.stock || req.body.quantity || 1)
  );

  await CartItem.updateOne(
    { customerId: req.params.customerId, productId: req.params.productId },
    { $set: { quantity } }
  );

  res.json(await getCartItems(req.params.customerId));
}

export async function deleteCartItem(req, res) {
  await CartItem.deleteOne({
    customerId: req.params.customerId,
    productId: req.params.productId
  });

  res.json(await getCartItems(req.params.customerId));
}
