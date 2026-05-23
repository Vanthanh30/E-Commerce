import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from "../controllers/product.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", asyncHandler(listProducts));
router.get("/:id", asyncHandler(getProduct));
router.post("/", upload.single("image"), asyncHandler(createProduct));
router.put("/:id", upload.single("image"), asyncHandler(updateProduct));
router.delete("/:id", asyncHandler(deleteProduct));

export default router;
