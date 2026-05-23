import { Router } from "express";
import {
  createBargain,
  getBargain,
  listBargains,
  respondBargain
} from "../controllers/bargain.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listBargains));
router.get("/:id", asyncHandler(getBargain));
router.post("/", asyncHandler(createBargain));
router.post("/:id/respond", asyncHandler(respondBargain));

export default router;
