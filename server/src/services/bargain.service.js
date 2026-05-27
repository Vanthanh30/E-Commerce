const MAX_ROUNDS = 3;

export function getRoundRequiredPrice(product, round) {
  const fixedPrice = Number(product.fixedPrice || 0);
  const configuredMin = Number(product.minPrice || 0);
  const safeRound = Math.min(Math.max(Number(round || 1), 1), MAX_ROUNDS);

  if (configuredMin > 0 && configuredMin <= 100) {
    const maxDiscount = fixedPrice * (configuredMin / 100);
    return Math.floor(fixedPrice - (maxDiscount * safeRound) / MAX_ROUNDS);
  }

  if (configuredMin > 100 && configuredMin < fixedPrice) {
    const maxDiscount = fixedPrice - configuredMin;
    return Math.floor(fixedPrice - (maxDiscount * safeRound) / MAX_ROUNDS);
  }

  return fixedPrice;
}

export function processBargain({ product, offerPrice, round }) {
  const requiredPrice = getRoundRequiredPrice(product, round);

  if (Number(offerPrice) >= requiredPrice) {
    return {
      status: "accepted",
      botPrice: Number(offerPrice),
      botMessage: `Shop dong y muc gia ${offerPrice} VND`,
    };
  }

  if (Number(round) >= MAX_ROUNDS) {
    return {
      status: "rejected",
      botPrice: requiredPrice,
      botMessage: `Shop tu choi muc gia ${offerPrice} VND. Cam on ban da tham gia mac ca`,
    };
  }

  return {
    status: "countered",
    botPrice: requiredPrice,
    botMessage: "Shop chua the ban voi muc gia nay.",
  };
}
