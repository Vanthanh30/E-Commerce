import Bargain from "../models/bargain.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { createSingleItemOrder } from "../helpers/order.helper.js";
import { bargainStatus } from "../helpers/status.helper.js";
import { processBargain } from "../services/bargain.service.js";

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

  const offerPrice = Number(req.body.price || 0);

  const quantity = Number(req.body.quantity || 1);

  const customerMessage = req.body.note || "";

  const product = await Product.findOne({
    productId
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found"
    });
  }

  const bargainId = `${customerId}_${productId}`;

  let bargain = await Bargain.findOne({
    bargainId
  });

  // tạo session mới
  if (!bargain) {

    bargain = await Bargain.create({
      bargainId,
      customerId,
      productId,
      quantity,
      
      // Giảm time xuống 1p để test
      expiredAt: new Date(
        Date.now() + 20 * 60 * 1000
      ),

      details: []
    });
  }

  // hết hạn
  if (new Date() > bargain.expiredAt) {

    bargain.status = "expired";

    await bargain.save();

    return res.status(400).json({
      message: "Bargain session expired"
    });
  }

  // session kết thúc
  if (
    bargain.status === "accepted" ||
    bargain.status === "rejected"
  ) {
    return res.status(400).json({
      message: "Bargain ended"
    });
  }

  // round hiện tại
  const round = bargain.details.length + 1;

  // quá số round
  if (round > 3) {
    return res.status(400).json({
      message: "Maximum rounds reached"
    });
  }

  // bot xử lý
  const result = processBargain({
    product,
    offerPrice,
    round
  });

  // lưu lịch sử
  bargain.details.push({
    round,

    customerPrice: offerPrice,

    botPrice: result.botPrice,

    quantity,

    customerMessage,

    botMessage: result.botMessage,

    status: result.status,

    time: new Date()
  });

  // update session status
  if (
    result.status === "accepted" ||
    result.status === "rejected"
  ) {
    bargain.status = result.status;
  }

  await bargain.save();

  return res.json({
    success: true,

    bargainId,

    round,

    status: result.status,

    customerPrice: offerPrice,

    botPrice: result.botPrice,

    botMessage: result.botMessage
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
