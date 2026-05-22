import { Router } from "express"
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getRestaurantOrders,
  getRestaurantAnalytics,
  getAvailableOrders,
  getDriverOrders
} from "../controllers/orderController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/", protect, createOrder)
router.get("/my-orders", protect, getMyOrders)
router.get("/available", protect, getAvailableOrders)  // ← must be before /:id
router.get("/driver/my-orders", protect, getDriverOrders)
router.get("/restaurant/:restaurantId", protect, getRestaurantOrders)
router.get("/restaurant/:restaurantId/analytics", protect, getRestaurantAnalytics)

router.get("/:id", protect, getOrder)          // ← must be after specific routes
router.put("/:id/status", protect, updateOrderStatus)

export default router