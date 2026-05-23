export async function nextCode(model, field, prefix, width = 3, filter = {}) {
  const last = await model
    .findOne({ [field]: new RegExp(`^${prefix}`), ...filter })
    .sort({ [field]: -1 })
    .lean();

  const current = last?.[field]?.startsWith(prefix)
    ? Number.parseInt(last[field].slice(prefix.length), 10)
    : 0;
  const next = Number.isFinite(current) ? current + 1 : 1;
  return `${prefix}${String(next).padStart(width, "0")}`;
}

export async function nextInvoiceId(Order, customerId) {
  const last = await Order.findOne({ customerId })
    .sort({ orderId: -1 })
    .lean();

  const current = last?.orderId ? Number.parseInt(last.orderId.slice(-3), 10) : 0;
  return `${customerId}HD${String((Number.isFinite(current) ? current : 0) + 1).padStart(3, "0")}`;
}
