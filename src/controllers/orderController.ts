import { Request, Response } from "express"
import Order from "../models/Order"
import Restaurant from "../models/Restaurant"
import { io } from "../index"
import User from "../models/User"

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

    // Give customer 10 points for every delivered order
    if (status === "delivered") {
      await User.findByIdAndUpdate(order.customerId, {
        $inc: { foodiePoints: 10 },
      })
    }

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

// @desc    Get restaurant analytics
// @route   GET /api/orders/restaurant/:restaurantId/analytics
export const getRestaurantAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params

    // Get all orders for this restaurant
    const orders = await Order.find({
      restaurantId: String(restaurantId),
    })

    // Total orders
    const totalOrders = orders.length

    // Total revenue (delivered orders only)
    const totalRevenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.totalAmount + o.deliveryFee, 0)

    // Orders by status
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      on_the_way: orders.filter((o) => o.status === "on_the_way").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }

    // Popular items
    const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 }
        }
        itemCounts[item.name].count += item.quantity
        itemCounts[item.name].revenue += item.price * item.quantity
      })
    })

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Revenue by day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const revenueByDay = last7Days.map((day) => {
      const dayOrders = orders.filter((o) => {
        const orderDay = new Date(o.createdAt).toISOString().split("T")[0]
        return orderDay === day && o.status === "delivered"
      })
      const revenue = dayOrders.reduce(
        (sum, o) => sum + o.totalAmount + o.deliveryFee,
        0
      )
      return {
        day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
        revenue: Math.round(revenue * 100) / 100,
        orders: dayOrders.length,
      }
    })

    res.status(200).json({
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      ordersByStatus,
      popularItems,
      revenueByDay,
    })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}