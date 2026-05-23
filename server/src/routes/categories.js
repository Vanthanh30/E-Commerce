import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "../controllers/category.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listCategories));
router.post("/", asyncHandler(createCategory));
router.put("/:id", asyncHandler(updateCategory));
router.delete("/:id", asyncHandler(deleteCategory));

export default router;
