import { Router } from "express";
import {
  createBargain,
  getBargain,
  listBargains,
  respondBargain,
  chatBargain,
  confirmBargain,
} from "../controllers/bargain.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listBargains));
// chat
router.post("/chat", asyncHandler(chatBargain));
//
router.get("/:id", asyncHandler(getBargain));
router.post("/", asyncHandler(createBargain));
router.post("/:id/respond", asyncHandler(respondBargain));
router.post("/:id/confirm", asyncHandler(confirmBargain));

export default router;
