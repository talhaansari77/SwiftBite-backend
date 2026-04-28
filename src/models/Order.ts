import mongoose, { Document, Schema } from "mongoose"

export interface IOrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface IOrder extends Document {
  customerId: string
  restaurantId: string
  items: IOrderItem[]
  totalAmount: number
  deliveryFee: number
  status: "pending" | "confirmed" | "preparing" | "on_the_way" | "delivered" | "cancelled"
  address: string
  paymentStatus: "pending" | "paid" | "failed"
  paymentIntentId?: string
  createdAt: Date
}

const OrderItemSchema = new Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, default: "" },
})

const OrderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: String,
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "on_the_way", "delivered", "cancelled"],
      default: "pending",
    },
    address: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

export default mongoose.model<IOrder>("Order", OrderSchema)