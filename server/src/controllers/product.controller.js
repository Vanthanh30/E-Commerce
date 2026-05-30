import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import { uploadImageBuffer } from "../helpers/cloudinary.helper.js";
import { nextCode } from "../helpers/id.helper.js";

async function attachCategoryName(products) {
  const categoryIds = [
    ...new Set(products.map((item) => item.categoryId).filter(Boolean)),
  ];
  const categories = await Category.find({
    categoryId: { $in: categoryIds },
  }).lean();
  const categoryMap = new Map(
    categories.map((item) => [item.categoryId, item.name]),
  );
  return products.map((item) => ({
    ...item,
    categoryName: categoryMap.get(item.categoryId) || "",
  }));
}

export async function listProducts(req, res) {
  const filter = {};
  if (req.query.includeInactive !== "true") filter.status = 1;
  if (req.query.categoryId) filter.categoryId = req.query.categoryId;
  if (req.query.q) filter.name = { $regex: req.query.q, $options: "i" };

  const products = await Product.find(filter).sort({ productId: -1 }).lean();
  res.json(await attachCategoryName(products));
}

export async function getProduct(req, res) {
  const product = await Product.findOneAndUpdate(
    { productId: req.params.id },
    { $inc: { views: 1 } },
    { returnDocument: "after" },
  ).lean();

  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  const [result] = await attachCategoryName([product]);
  res.json(result);
}

export async function getTrendingProducts(req, res) {
  const products = await Product.find({ status: 1 })
    .sort({ views: -1 })
    .limit(10)
    .lean();

  res.json(await attachCategoryName(products));
}

export async function createProduct(req, res) {
  const name = String(req.body.name || "").trim();
  const fixedPrice = Number(req.body.fixedPrice);
  const minPrice = Number(req.body.minPrice || 0);
  const stock = Math.floor(Number(req.body.stock));

  if (!name) {
    res.status(400).json({ message: "Product name is required" });
    return;
  }

  if (!Number.isFinite(fixedPrice) || fixedPrice <= 0) {
    res.status(400).json({ message: "Product price must be greater than 0" });
    return;
  }

  if (!Number.isFinite(minPrice) || minPrice < 0 || minPrice > 100) {
    res.status(400).json({ message: "Bargain discount must be between 0 and 100" });
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    res.status(400).json({ message: "Stock must be a non-negative integer" });
    return;
  }

  const productId = await nextCode(Product, "productId", "SP");
  const uploaded = await uploadImageBuffer(req.file);
  const product = await Product.create({
    productId,
    categoryId: req.body.categoryId || null,
    name,
    fixedPrice,
    minPrice,
    stock,
    imageUrl: uploaded?.url || req.body.imageUrl || "",
    cloudinaryPublicId: uploaded?.publicId || "",
    description: req.body.description || "",
    status: 1,
  });

  res.status(201).json({ productId: product.productId });
}

export async function updateProduct(req, res) {
  const name = String(req.body.name || "").trim();
  const fixedPrice = Number(req.body.fixedPrice);
  const minPrice = Number(req.body.minPrice || 0);
  const stock = Math.floor(Number(req.body.stock));

  if (!name) {
    res.status(400).json({ message: "Product name is required" });
    return;
  }

  if (!Number.isFinite(fixedPrice) || fixedPrice <= 0) {
    res.status(400).json({ message: "Product price must be greater than 0" });
    return;
  }

  if (!Number.isFinite(minPrice) || minPrice < 0 || minPrice > 100) {
    res.status(400).json({ message: "Bargain discount must be between 0 and 100" });
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    res.status(400).json({ message: "Stock must be a non-negative integer" });
    return;
  }

  const uploaded = await uploadImageBuffer(req.file);
  const update = {
    categoryId: req.body.categoryId || null,
    name,
    fixedPrice,
    minPrice,
    stock,
    description: req.body.description || "",
  };

  if (uploaded) {
    update.imageUrl = uploaded.url;
    update.cloudinaryPublicId = uploaded.publicId;
  } else if (req.body.imageUrl) {
    update.imageUrl = req.body.imageUrl;
  }

  await Product.updateOne({ productId: req.params.id }, { $set: update });
  res.json({ message: "Product updated" });
}

export async function deleteProduct(req, res) {
  await Product.updateOne(
    { productId: req.params.id },
    { $set: { status: 0 } },
  );

  res.json({ message: "Product hidden" });
}
