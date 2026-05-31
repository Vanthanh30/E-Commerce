import CartItem from "../models/cartItem.model.js";
import Product from "../models/product.model.js";
import Bargain from "../models/bargain.model.js";
import mongoose from "mongoose";

let cartIndexesReady = false;

async function ensureCartIndexes() {
  if (cartIndexesReady) return;

  try {
    await CartItem.collection.dropIndex("customerId_1_productId_1");
  } catch (err) {
    if (err.codeName !== "IndexNotFound" && err.code !== 27) throw err;
  }

  try {
    await CartItem.collection.dropIndex("customerId_1_productId_1_salePrice_1");
  } catch (err) {
    if (err.codeName !== "IndexNotFound" && err.code !== 27) throw err;
  }

  await CartItem.collection.createIndex(
    { customerId: 1, productId: 1, salePrice: 1, bargainId: 1 },
    { unique: true },
  );

  cartIndexesReady = true;
}

async function getCartItems(customerId) {
  await ensureCartIndexes();
  const cart = await CartItem.find({ customerId })
    .sort({ updatedAt: -1 })
    .lean();
  const productIds = cart.map((item) => item.productId);
  const products = await Product.find({
    productId: { $in: productIds },
  }).lean();
  const productMap = new Map(products.map((item) => [item.productId, item]));
  const bargains = await Bargain.find({
    customerId,
    status: "accepted",
  }).lean();

  return cart.map((item) => {
    const product = productMap.get(item.productId) || {};
    const price = item.salePrice ?? product.fixedPrice ?? 0;
    let orderSessionExpiresAt = null;

    if (item.bargainId) {
      const matchedBargain = bargains.find(
        (b) => b.bargainId === item.bargainId,
      );
      if (matchedBargain) {
        orderSessionExpiresAt = matchedBargain.orderSessionExpiresAt;
      }
    } else if (item.salePrice != null && item.salePrice < product.fixedPrice) {
      const matchedBargain = bargains.find(
        (b) =>
          b.productId === item.productId &&
          b.details.some(
            (d) =>
              d.status === "accepted" &&
              (d.botPrice === item.salePrice ||
                d.customerPrice === item.salePrice),
          ),
      );
      if (matchedBargain) {
        orderSessionExpiresAt = matchedBargain.orderSessionExpiresAt;
      }
    }
    return {
      cartItemId: String(item._id),
      customerId: item.customerId,
      productId: item.productId,
      quantity: item.quantity,
      productName: product.name || "",
      name: product.name || "",
      price,
      fixedPrice: product.fixedPrice || 0,
      salePrice: item.salePrice,
      bargainId: item.bargainId || null,
      priceType: item.salePrice == null ? "fixed" : "bargain",
      imageUrl: product.imageUrl || "",
      stock: product.stock || 0,
      orderSessionExpiresAt,
      total: Number(price || 0) * Number(item.quantity || 0),
    };
  });
}

export async function listCart(req, res) {
  res.json(await getCartItems(req.params.customerId));
}

export async function addToCart(req, res) {
  await ensureCartIndexes();
  const customerId = req.body.customerId;
  const productId = req.body.productId;
  const bargainId = req.body.bargainId || null;
  const quantity = Math.floor(Number(req.body.quantity || 1));
  const salePrice = req.body.price == null ? null : Number(req.body.price);

  if (
    !customerId ||
    !productId ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    res.status(400).json({ message: "Invalid cart item" });
    return;
  }
  const product = await Product.findOne({ productId, status: 1 }).lean();

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  if (Number(product.stock || 0) <= 0) {
    res.status(400).json({ message: "Product is out of stock" });
    return;
  }

  let bargain = null;
  if (bargainId) {
    bargain = await Bargain.findOne({ bargainId });

    if (!bargain) {
      res.status(404).json({ message: "Bargain not found" });
      return;
    }

    if (bargain.customerId !== customerId || bargain.productId !== productId) {
      res.status(400).json({ message: "Bargain does not match cart item" });
      return;
    }

    if (bargain.status !== "accepted") {
      res.status(400).json({ message: "Bargain is not accepted" });
      return;
    }

    if (
      bargain.orderSessionExpiresAt &&
      new Date() > new Date(bargain.orderSessionExpiresAt)
    ) {
      res.status(400).json({ message: "Bargain order session expired" });
      return;
    }

    // if (bargain.addedToCart) {
    //   res.status(409).json({ message: "Bargain already added to cart" });
    //   return;
    // }
  }

  if (salePrice != null && (!Number.isFinite(salePrice) || salePrice <= 0)) {
    res.status(400).json({ message: "Invalid sale price" });
    return;
  }

  const normalizedSalePrice =
    salePrice != null && salePrice > 0 ? salePrice : null;
  const normalizedBargainId = bargainId || null;
  const existing = await CartItem.findOne({
    customerId,
    productId,
    salePrice: normalizedSalePrice,
    bargainId: normalizedBargainId,
  });
  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + quantity,
      product.stock || existing.quantity + quantity,
    );
    await existing.save();
  } else {
    await CartItem.create({
      customerId,
      productId,
      quantity: Math.min(quantity, product.stock || quantity),
      salePrice: normalizedSalePrice,
      bargainId: normalizedBargainId,
    });
  }

  if (bargain) {
    bargain.addedToCart = true;
    await bargain.save();
  }

  res.status(201).json(await getCartItems(customerId));
}

export async function updateCartItem(req, res) {
  await ensureCartIndexes();
  const itemFilter = mongoose.Types.ObjectId.isValid(req.params.productId)
    ? { _id: req.params.productId, customerId: req.params.customerId }
    : { customerId: req.params.customerId, productId: req.params.productId };
  const cartItem = await CartItem.findOne(itemFilter).lean();
  if (!cartItem) {
    res.status(404).json({ message: "Cart item not found" });
    return;
  }

  const product = await Product.findOne({
    productId: cartItem.productId,
  }).lean();
  const requestedQuantity = Math.floor(Number(req.body.quantity || 1));
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    res.status(400).json({ message: "Invalid quantity" });
    return;
  }

  const quantity = Math.min(
    requestedQuantity,
    Number(product?.stock || req.body.quantity || 1),
  );

  await CartItem.updateOne({ _id: cartItem._id }, { $set: { quantity } });

  res.json(await getCartItems(req.params.customerId));
}

export async function deleteCartItem(req, res) {
  await ensureCartIndexes();
  const itemFilter = mongoose.Types.ObjectId.isValid(req.params.productId)
    ? { _id: req.params.productId, customerId: req.params.customerId }
    : { customerId: req.params.customerId, productId: req.params.productId };

  await CartItem.deleteOne(itemFilter);

  res.json(await getCartItems(req.params.customerId));
}
