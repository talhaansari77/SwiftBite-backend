import mongoose, { Document, Schema } from "mongoose"

export interface IRestaurant extends Document {
  name: string
  description: string
  image: string
  cuisine: string
  rating: number
  totalRatings: number
  deliveryTime: string
  deliveryFee: number
  minimumOrder: number
  isOpen: boolean
  address: string
  phone: string
  ownerId: string
  createdAt: Date
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      default: "",
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine type is required"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
      default: "30-45 min",
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    ownerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IRestaurant>("Restaurant", RestaurantSchema)