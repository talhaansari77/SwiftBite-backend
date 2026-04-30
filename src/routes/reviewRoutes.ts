import { Router } from "express"
import { createReview, getRestaurantReviews } from "../controllers/reviewController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.post("/", protect, createReview)
router.get("/restaurant/:restaurantId", getRestaurantReviews)

export default router