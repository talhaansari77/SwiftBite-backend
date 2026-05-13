import { Router } from "express"
import {
  validatePromoCode,
  applyPromoCode,
  createPromoCode,
  getPromoCodes,
} from "../controllers/promoController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/validate", protect, validatePromoCode)
router.post("/apply", protect, applyPromoCode)
router.post("/create", protect, createPromoCode)
router.get("/", protect, getPromoCodes)

export default router