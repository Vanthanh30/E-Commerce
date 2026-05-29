const MAX_ROUNDS = 3;

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getSafeRound(round) {
  return Math.min(Math.max(normalizeNumber(round, 1), 1), MAX_ROUNDS);
}

export function getRoundRequiredPrice(product, round) {
  const fixedPrice = normalizeNumber(product.fixedPrice, 0);
  const configuredMin = normalizeNumber(product.minPrice, 0);
  const safeRound = getSafeRound(round);

  if (fixedPrice <= 0) {
    return 0;
  }

  if (configuredMin > 0 && configuredMin <= 100) {
    const maxDiscount = fixedPrice * (configuredMin / 100);
    const rawPrice = fixedPrice - (maxDiscount * safeRound) / MAX_ROUNDS;
    return safeRound === MAX_ROUNDS ? Math.floor(rawPrice) : Math.ceil(rawPrice);
  }

  if (configuredMin > 100 && configuredMin < fixedPrice) {
    const maxDiscount = fixedPrice - configuredMin;
    const rawPrice = fixedPrice - (maxDiscount * safeRound) / MAX_ROUNDS;
    const price = safeRound === MAX_ROUNDS ? Math.floor(rawPrice) : Math.ceil(rawPrice);
    return Math.max(price, configuredMin);
  }

  return fixedPrice;
}

export function processBargain({ product, offerPrice, round }) {
  const offer = normalizeNumber(offerPrice, 0);
  const safeRound = getSafeRound(round);
  const requiredPrice = getRoundRequiredPrice(product, safeRound);

  if (offer >= requiredPrice) {
    return {
      status: "accepted",
      botPrice: offer,
      botMessage: `Shop đồng ý mức giá ${offer} VND`,
    };
  }

  if (safeRound >= MAX_ROUNDS) {
    return {
      status: "rejected",
      botPrice: requiredPrice,
      botMessage: `Shop từ chối mức giá ${offer} VND. Cảm ơn bạn đã tham gia mặc cả`,
    };
  }

  return {
    status: "countered",
    botPrice: requiredPrice,
    botMessage: "Shop chưa thể bán với mức giá ${offer} VND.",
  };
}
