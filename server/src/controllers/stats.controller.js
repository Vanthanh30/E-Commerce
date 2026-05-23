import Order from "../models/order.model.js";

export async function ordersByMonth(req, res) {
  const year = Number(req.query.year || new Date().getFullYear());
  const rows = await Order.aggregate([
    {
      $match: {
        saleDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    {
      $group: {
        _id: { month: { $month: "$saleDate" }, year: { $year: "$saleDate" } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        year: "$_id.year",
        orderCount: 1
      }
    }
  ]);

  res.json(rows);
}

export async function revenueByMonth(req, res) {
  const year = Number(req.query.year || new Date().getFullYear());
  const rows = await Order.aggregate([
    {
      $match: {
        status: { $in: [2, 3, 4] },
        saleDate: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: { month: { $month: "$saleDate" }, year: { $year: "$saleDate" } },
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.salePrice"] } }
      }
    },
    { $sort: { "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        year: "$_id.year",
        revenue: 1
      }
    }
  ]);

  res.json(rows);
}
