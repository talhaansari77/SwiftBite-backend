import mongoose, { Document, Schema } from "mongoose"

export interface IReview extends Document {
  restaurantId: string
  customerId: string
  customerName: string
  orderId: string
  rating: number
  comment: string
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    restaurantId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

export default mongoose.model<IReview>("Review", ReviewSchema)