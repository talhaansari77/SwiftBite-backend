import { Router } from "express"
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getRestaurantOrders,
  getRestaurantAnalytics,
  getAvailableOrders
} from "../controllers/orderController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/", protect, createOrder)
router.get("/my-orders", protect, getMyOrders)
router.get("/:id", protect, getOrder)
router.put("/:id/status", protect, updateOrderStatus)
router.get("/restaurant/:restaurantId", protect, getRestaurantOrders)
router.get("/restaurant/:restaurantId/analytics", protect, getRestaurantAnalytics)
router.get("/available", protect, getAvailableOrders)

export default router