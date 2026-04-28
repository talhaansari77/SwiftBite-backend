import { Router } from "express"
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getRestaurantOrders,
} from "../controllers/orderController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/", protect, createOrder)
router.get("/my-orders", protect, getMyOrders)
router.get("/:id", protect, getOrder)
router.put("/:id/status", protect, updateOrderStatus)
router.get("/restaurant/:restaurantId", protect, getRestaurantOrders)

export default router