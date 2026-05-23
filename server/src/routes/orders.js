import { Router } from "express";
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listOrders));
router.get("/:id", asyncHandler(getOrder));
router.post("/", asyncHandler(createOrder));
router.patch("/:id/status", asyncHandler(updateOrderStatus));

export default router;
