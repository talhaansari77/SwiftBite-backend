import { Request, Response } from "express"
import Order from "../models/Order"
import Restaurant from "../models/Restaurant"
import { io } from "../index"

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, items, address, paymentMethod = "cash" } = req.body

    if (!restaurantId || !items || !address) {
      res.status(400).json({ message: "All fields are required" })
      return
    }

    // Get restaurant for delivery fee
    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found" })
      return
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    const order = await Order.create({
      customerId: (req as any).userId,
      restaurantId,
      items,
      totalAmount,
      deliveryFee: restaurant.deliveryFee,
      address,
      paymentMethod,
    })

    res.status(201).json({
      message: "Order placed successfully",
      order,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Get my orders (customer)
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({
      customerId: (req as any).userId,
    }).sort({ createdAt: -1 })

    res.status(200).json({ orders })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      res.status(404).json({ message: "Order not found" })
      return
    }

    res.status(200).json({ order })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Update order status and notify customer in real-time
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body

    // Update order status in database
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!order) {
      res.status(404).json({ message: "Order not found" })
      return
    }

    // Emit real-time update to the customer
    // Only the customer in this order's room will receive this
    io.to(order._id.toString()).emit("order_status_update", {
      orderId: order._id,
      status: order.status,
      message: getStatusMessage(status),
    })

    res.status(200).json({
      message: "Order status updated",
      order,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Helper function to get a friendly message for each status
const getStatusMessage = (status: string): string => {
  const messages: Record<string, string> = {
    confirmed: "Your order has been confirmed! ✅",
    preparing: "The restaurant is preparing your order 👨‍🍳",
    on_the_way: "Your order is on the way! 🛵",
    delivered: "Your order has been delivered! 🎉",
    cancelled: "Your order has been cancelled ❌",
  }
  return messages[status] || "Order status updated"
}

// @desc    Get restaurant orders (for restaurant owner)
// @route   GET /api/orders/restaurant/:restaurantId
export const getRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({
      restaurantId: String(req.params.restaurantId),
    }).sort({ createdAt: -1 })

    res.status(200).json({ orders })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}