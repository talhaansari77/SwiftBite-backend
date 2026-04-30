import { Request, Response } from "express"
import Review from "../models/Review"
import Restaurant from "../models/Restaurant"
import Order from "../models/Order"
import User from "../models/User"

// @desc    Create a review
// @route   POST /api/reviews
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, orderId, rating, comment } = req.body
    const customerId = (req as any).userId

    // Check if order exists and belongs to customer
    const order = await Order.findById(orderId)
    if (!order) {
      res.status(404).json({ message: "Order not found" })
      return
    }

    // Only allow reviews for delivered orders
    if (order.status !== "delivered") {
      res.status(400).json({ message: "You can only review delivered orders" })
      return
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ orderId })
    if (existingReview) {
      res.status(400).json({ message: "You already reviewed this order" })
      return
    }

    // Get customer name
    const customer = await User.findById(customerId)

    // Create review
    const review = await Review.create({
      restaurantId,
      customerId,
      customerName: customer?.name || "Anonymous",
      orderId,
      rating,
      comment,
    })

    // Update restaurant average rating
    const reviews = await Review.find({ restaurantId })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: reviews.length,
    })

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
export const getRestaurantReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({
      restaurantId: String(req.params.restaurantId),
    }).sort({ createdAt: -1 })

    res.status(200).json({ reviews })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}