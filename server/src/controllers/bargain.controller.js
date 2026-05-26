import Bargain from "../models/bargain.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { createSingleItemOrder } from "../helpers/order.helper.js";
import { bargainStatus } from "../helpers/status.helper.js";
import { processBargain } from "../services/bargain.service.js";

const MAX_BARGAIN_ROUNDS = 3;
const SESSION_MINUTES = 20;

function isFinal(status) {
  return ["accepted", "rejected"].includes(status);
}

function isExpired(bargain) {
  return bargain?.expiredAt && new Date() > new Date(bargain.expiredAt);
}

async function expireBargain(bargain) {
  if (bargain.status !== "expired") {
    bargain.status = "expired";
    await bargain.save();
  }
}

async function markExpiredBargains(filter = {}) {
  await Bargain.updateMany(
    {
      ...filter,
      status: "negotiating",
      expiredAt: { $lt: new Date() }
    },
    { $set: { status: "expired" } }
  );
}

async function makeBargainId(customerId, productId) {
  const baseId = `${customerId}_${productId}`;
  const existing = await Bargain.findOne({ bargainId: baseId }).lean();
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return existing ? `${baseId}_${suffix}` : baseId;
}

function lastDetail(bargain) {
  return [...(bargain?.details || [])].sort((a, b) => Number(b.round) - Number(a.round))[0] || null;
}

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
    const baseRow = {
      bargainId: bargain.bargainId,
      productName: product.name || "",
      imageUrl: product.imageUrl || "",
      customerId: bargain.customerId,
      listedPrice: product.fixedPrice || 0,
      minPrice: product.minPrice || 0,
      quantity: bargain.quantity || 1,
      productId: bargain.productId,
      customerName: customer.fullName || "",
      address: customer.address || "",
      expiredAt: bargain.expiredAt,
      sessionStatus: bargain.status
    };

    if (!bargain.details.length) {
      return [{
        ...baseRow,
        offerPrice: null,
        botPrice: null,
        note: "",
        customerMessage: "",
        botMessage: "",
        time: bargain.updatedAt || bargain.createdAt,
        round: 0,
        status: bargain.status,
        statusText: bargain.status === "expired" ? "Het han" : "Dang thuong luong"
      }];
    }

    return bargain.details.map((detail) => ({
      ...baseRow,
      offerPrice: detail.customerPrice,
      botPrice: detail.botPrice,
      note: detail.botMessage || "",
      customerMessage: detail.customerMessage || "",
      botMessage: detail.botMessage || "",
      time: detail.time,
      quantity: detail.quantity || bargain.quantity || 1,
      round: detail.round,
      status: detail.status,
      statusText: bargainStatus(detail.round, detail.status)
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

export async function listBargains(req, res) {
  const customerId = req.query.customerId || null;
  await markExpiredBargains(customerId ? { customerId } : {});
  const rows = await bargainRows({ customerId: req.query.customerId || null });
  const result = req.query.latest === "true" || req.query.admin === "true" ? latestRounds(rows) : rows;
  res.json(req.query.admin === "true"
    ? result.filter((row) => ["pending", "accepted", "rejected"].includes(row.status))
    : result);
}

export async function getBargain(req, res) {
  await markExpiredBargains({ bargainId: req.params.id });
  res.json(await bargainRows({ id: req.params.id }));
}

export async function createBargain(req, res) {
  const customerId = req.body.customerId;
  const productId = req.body.productId;
  const quantity = Number(req.body.quantity || 1);

  const product = await Product.findOne({ productId });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await markExpiredBargains({ customerId, productId });

  let bargain = await Bargain.findOne({
    customerId,
    productId,
    status: "negotiating"
  }).sort({ updatedAt: -1 });

  if (!bargain) {
    const bargainId = await makeBargainId(customerId, productId);
    bargain = await Bargain.create({
      bargainId,
      customerId,
      productId,
      quantity,
      expiredAt: new Date(Date.now() + SESSION_MINUTES * 60 * 1000),
      details: []
    });
  }

  if (isExpired(bargain)) {
    await expireBargain(bargain);
    return res.status(400).json({ message: "Bargain session expired" });
  }

  if (isFinal(bargain.status)) {
    return res.status(400).json({ message: "Bargain ended" });
  }

  res.json({
    success: true,
    bargainId: bargain.bargainId,
    customerId,
    productId,
    quantity: bargain.quantity || quantity,
    status: bargain.status,
    expiredAt: bargain.expiredAt
  });
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
  const price = Number(req.body.price || current.customerPrice || 0);
  const quantity = Number(req.body.quantity || current.quantity || 1);
  const note = req.body.note || current.botMessage || "";
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
  current.customerPrice = price;
  current.quantity = quantity;
  current.botMessage = note;
  current.time = new Date();
  await bargain.save();

  res.json({
    bargainId: req.params.id,
    round: current.round,
    statusText: bargainStatus(current.round, nextStatus),
    invoiceId
  });
}

export async function chatBargain(req, res) {
  const { bargainId, customerId, productId, offerPrice } = req.body;

  const product = await Product.findOne({ productId });
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let bargain = bargainId
    ? await Bargain.findOne({ bargainId })
    : await Bargain.findOne({ customerId, productId, status: "negotiating" }).sort({ updatedAt: -1 });

  if (!bargain) {
    const nextBargainId = await makeBargainId(customerId, productId);
    bargain = await Bargain.create({
      bargainId: nextBargainId,
      customerId,
      productId,
      expiredAt: new Date(Date.now() + SESSION_MINUTES * 60 * 1000),
      details: []
    });
  }

  if (isExpired(bargain)) {
    await expireBargain(bargain);
    return res.status(400).json({ message: "Bargain session expired" });
  }

  if (isFinal(bargain.status) || bargain.status === "expired") {
    return res.status(400).json({ message: "Bargain ended" });
  }

  const round = bargain.details.length + 1;
  if (round > MAX_BARGAIN_ROUNDS) {
    return res.status(400).json({ message: "Phien mac ca da ket thuc" });
  }

  const customerPrice = Number(offerPrice);
  const result = processBargain({
    product,
    offerPrice: customerPrice,
    round
  });

  bargain.details.push({
    round,
    customerPrice,
    botPrice: result.botPrice,
    quantity: bargain.quantity || 1,
    customerMessage: "",
    botMessage: result.botMessage,
    status: result.status,
    time: new Date()
  });

  if (isFinal(result.status)) {
    bargain.status = result.status;
  }

  await bargain.save();

  res.json({
    bargainId: bargain.bargainId,
    round,
    status: result.status,
    customerPrice,
    botPrice: result.botPrice,
    botMessage: result.botMessage
  });
}
