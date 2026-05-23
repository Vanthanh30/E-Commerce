import { Router } from "express";
import {
  addToCart,
  deleteCartItem,
  listCart,
  updateCartItem
} from "../controllers/cart.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";

const router = Router();

router.get("/:customerId", asyncHandler(listCart));
router.post("/", asyncHandler(addToCart));
router.patch("/:customerId/:productId", asyncHandler(updateCartItem));
router.delete("/:customerId/:productId", asyncHandler(deleteCartItem));

export default router;
