export function bargainStatus(round, status = "pending") {
  const map = {
    pending: `Waiting for approval round ${round}`,
    countered: `Waiting for customer response round ${round}`,
    accepted: `Accepted round ${round}`,
    rejected: `Rejected round ${round}`
  };
  return map[status] || "Khong xac dinh";
}

export function orderStatus(status) {
  const map = {
    1: "Cho xac nhan",
    2: "Da xac nhan",
    3: "Dang giao",
    4: "Da giao",
    5: "Da huy"
  };
  return map[Number(status)] || "Khong xac dinh";
}
