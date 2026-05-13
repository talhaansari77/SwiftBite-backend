import mongoose, { Document, Schema } from "mongoose"

export interface IPromoCode extends Document {
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minimumOrder: number
  maxUses: number
  currentUses: number
  isActive: boolean
  expiryDate: Date
  createdAt: Date
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema)