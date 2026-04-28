import mongoose, { Document, Schema } from "mongoose"

export interface IMenuItem extends Document {
  name: string
  description: string
  price: number
  image: string
  category: string
  restaurantId: string
  isAvailable: boolean
  createdAt: Date
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    restaurantId: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IMenuItem>("MenuItem", MenuItemSchema)