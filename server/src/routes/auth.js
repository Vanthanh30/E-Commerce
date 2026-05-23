import { Router } from "express";
import { getCustomer, login, register, updateCustomer } from "../controllers/auth.controller.js";
import { asyncHandler } from "../helpers/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/register", asyncHandler(register));
router.get("/customers/:id", asyncHandler(getCustomer));
router.put("/customers/:id", asyncHandler(updateCustomer));

export default router;
