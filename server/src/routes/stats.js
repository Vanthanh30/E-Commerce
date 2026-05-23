import { Router } from "express";
import { ordersByMonth, revenueByMonth } from "../controllers/stats.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";

const router = Router();

router.get("/orders-by-month", asyncHandler(ordersByMonth));
router.get("/revenue-by-month", asyncHandler(revenueByMonth));

export default router;
