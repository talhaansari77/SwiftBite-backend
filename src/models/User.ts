import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone: string
  address: string
  avatar?: string
  role: "customer" | "restaurant" | "driver"
  resetPasswordToken?: string
  resetPasswordExpiry?: Date
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
    },
    address: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["customer", "restaurant", "driver"],
      default: "customer",
    },
     resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpiry: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IUser>("User", UserSchema)