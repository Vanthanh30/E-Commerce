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
    1: "Chờ xác nhận",
    2: "Đã xác nhận",
    3: "Đang giao",
    4: "Đã giao",
    5: "Đã hủy"
  };
  return map[Number(status)] || "Khong xac dinh";
}
