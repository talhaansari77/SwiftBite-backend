import { Router } from "express"
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  getMenuItems,
  addMenuItem,
  addMenuItemsBulk,
} from "../controllers/restaurantController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.get("/", getRestaurants)
router.get("/:id", getRestaurant)
router.post("/", protect, createRestaurant)
router.get("/:id/menu", getMenuItems)
router.post("/:id/menu", protect, addMenuItem)
router.post("/:id/menu/bulk", protect, addMenuItemsBulk)

export default router