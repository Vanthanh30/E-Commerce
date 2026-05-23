import Bargain from "../models/bargain.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { createSingleItemOrder } from "../helpers/order.helper.js";
import { bargainStatus } from "../helpers/status.helper.js";

const MAX_BARGAIN_ROUNDS = 3;

async function bargainRows({ customerId = null, id = null } = {}) {
  const filter = {};
  if (customerId) filter.customerId = customerId;
  if (id) filter.bargainId = id;

  const bargains = await Bargain.find(filter).sort({ updatedAt: -1 }).lean();
  const productIds = [...new Set(bargains.map((item) => item.productId))];
  const customerIds = [...new Set(bargains.map((item) => item.customerId))];
  const [products, customers] = await Promise.all([
    Product.find({ productId: { $in: productIds } }).lean(),
    Customer.find({ customerId: { $in: customerIds } }).lean()
  ]);
  const productMap = new Map(products.map((item) => [item.productId, item]));
  const customerMap = new Map(customers.map((item) => [item.customerId, item]));

  return bargains.flatMap((bargain) => {
    const product = productMap.get(bargain.productId) || {};
    const customer = customerMap.get(bargain.customerId) || {};
    return bargain.details.map((detail) => ({
      bargainId: bargain.bargainId,
      productName: product.name || "",
      imageUrl: product.imageUrl || "",
      customerId: bargain.customerId,
      offerPrice: detail.price,
      note: detail.note,
      listedPrice: product.fixedPrice || 0,
      minPrice: product.minPrice || 0,
      time: detail.time,
      quantity: detail.quantity,
      round: detail.round,
      status: detail.status,
      statusText: bargainStatus(detail.round, detail.status),
      productId: bargain.productId,
      customerName: customer.fullName || "",
      address: customer.address || ""
    }));
  }).sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
}

function latestRounds(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const current = grouped.get(row.bargainId);
    if (!current || Number(row.round) > Number(current.round)) grouped.set(row.bargainId, row);
  }
  return [...grouped.values()].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
}

function lastDetail(bargain) {
  return [...(bargain?.details || [])].sort((a, b) => Number(b.round) - Number(a.round))[0] || null;
}

function isFinal(status) {
  return ["accepted", "rejected"].includes(status);
}

export async function listBargains(req, res) {
  const rows = await bargainRows({ customerId: req.query.customerId || null });
  const result = req.query.latest === "true" || req.query.admin === "true" ? latestRounds(rows) : rows;
  res.json(req.query.admin === "true"
    ? result.filter((row) => ["pending", "accepted", "rejected"].includes(row.status))
    : result);
}

export async function getBargain(req, res) {
  res.json(await bargainRows({ id: req.params.id }));
}

export async function createBargain(req, res) {
  const customerId = req.body.customerId;
  const productId = req.body.productId;
  const bargainId = `${customerId}${productId}`;
  let bargain = await Bargain.findOne({ bargainId });

  if (!bargain) {
    bargain = await Bargain.create({
      bargainId,
      customerId,
      productId,
      quantity: Number(req.body.quantity || 1),
      details: []
    });
  }

  const latest = lastDetail(bargain);
  if (latest) {
    if (isFinal(latest.status)) {
      res.status(409).json({ message: "This bargain has ended" });
      return;
    }

    if (latest.status === "pending") {
      res.status(409).json({ message: "Waiting for admin response" });
      return;
    }

    if (latest.status !== "countered") {
      res.status(409).json({ message: "Current bargain status cannot continue" });
      return;
    }

    if (Number(latest.round) >= MAX_BARGAIN_ROUNDS) {
      res.status(400).json({ message: "Maximum 3 bargain rounds reached" });
      return;
    }
  }

  const round = latest ? Number(latest.round) + 1 : 1;
  bargain.details.push({
    round,
    price: Number(req.body.price || 0),
    quantity: Number(req.body.quantity || 1),
    time: new Date(),
    note: req.body.note || "",
    status: "pending"
  });
  await bargain.save();

  res.status(201).json({ bargainId, round, statusText: bargainStatus(round, "pending") });
}

export async function respondBargain(req, res) {
  const currentRound = Number(req.body.round);
  const bargain = await Bargain.findOne({ bargainId: req.params.id });
  const customer = bargain
    ? await Customer.findOne({ customerId: bargain.customerId }).lean()
    : null;
  const current = bargain?.details.find((item) => Number(item.round) === currentRound);

  if (!bargain || !current) {
    res.status(404).json({ message: "Bargain round not found" });
    return;
  }

  const latest = lastDetail(bargain);
  if (Number(latest?.round) !== currentRound) {
    res.status(409).json({ message: "Only the latest bargain round can be answered" });
    return;
  }

  if (current.status !== "pending") {
    res.status(409).json({ message: "Only pending bargain rounds can be answered" });
    return;
  }

  const action = req.body.action;
  const price = Number(req.body.price || current.price || 0);
  const quantity = Number(req.body.quantity || current.quantity || 1);
  const note = req.body.note || current.note || "";
  let invoiceId = null;
  let nextStatus;

  if (action === "accept") {
    nextStatus = "accepted";
    const order = await createSingleItemOrder({
      customerId: bargain.customerId,
      productId: bargain.productId,
      quantity,
      price,
      address: customer?.address || "",
      paymentMethod: 0,
      status: 1
    });
    invoiceId = order.orderId;
  } else if (action === "reject") {
    nextStatus = "rejected";
  } else if (action === "counter") {
    if (currentRound >= MAX_BARGAIN_ROUNDS) {
      res.status(400).json({ message: "Maximum 3 bargain rounds reached. Admin can only accept or reject" });
      return;
    }
    nextStatus = "countered";
  } else {
    res.status(400).json({ message: "action must be accept, reject, or counter" });
    return;
  }

  current.status = nextStatus;
  current.price = price;
  current.quantity = quantity;
  current.note = note;
  current.time = new Date();
  await bargain.save();

  res.json({
    bargainId: req.params.id,
    round: current.round,
    statusText: bargainStatus(current.round, nextStatus),
    invoiceId
  });
}
