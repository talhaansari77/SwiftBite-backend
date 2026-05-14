import mongoose, { Document, Schema } from "mongoose"

export interface IAddress {
  _id?: string
  label: string
  address: string
  isDefault: boolean
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone: string
  addresses: IAddress[]
  avatar?: string
  role: "customer" | "restaurant" | "driver"
  favourites: string[]
  walletBalance: number
  foodiePoints: number
  resetPasswordToken?: string
  resetPasswordExpiry?: Date
  createdAt: Date
}

const AddressSchema = new Schema({
  label: { type: String, required: true },
  address: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
})

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
    addresses: {
      type: [AddressSchema],
      default: [],
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
    favourites: {
      type: [String],
      default: [],
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    foodiePoints: {
      type: Number,
      default: 0,
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