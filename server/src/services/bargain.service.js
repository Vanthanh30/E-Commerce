const MAX_ROUNDS = 3;

export function processBargain({
  product,
  offerPrice,
  round
}) {

  const fixedPrice = Number(product.fixedPrice);

  let requiredPrice = fixedPrice;

  // ROUND 1 -> giảm tối đa 20%
  if (round === 1) {

    requiredPrice = Math.floor(
      fixedPrice * 0.8
    );
  }

  // ROUND 2 -> giảm tối đa 30%
  if (round === 2) {

    requiredPrice = Math.floor(
      fixedPrice * 0.7
    );
  }

  // ROUND 3 -> giảm tối đa 40%
  if (round === 3) {

    requiredPrice = Math.floor(
      fixedPrice * 0.6
    );
  }

  // USER ĐỦ GIÁ -> ACCEPT
  if (offerPrice >= requiredPrice) {

    return {

      status: "accepted",

      // chấp nhận đúng giá user trả
      botPrice: offerPrice,

      botMessage: `Shop đồng ý mức giá ${offerPrice} VNĐ`
    };
  }

  // ROUND 3 -> FAIL -> REJECT
  if (round === 3) {

    return {

      status: "rejected",

      botPrice: requiredPrice,

      botMessage: `Shop từ chối mức giá ${offerPrice} VNĐ. Cảm ơn bạn đã tham gia mặc cả`
    };
  }

  // ROUND 1-2 -> COUNTER
  return {

    status: "countered",

    botPrice: requiredPrice,

    botMessage: "Shop chưa thể bán với mức giá này."
  };
}