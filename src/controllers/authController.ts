import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User"

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET as string
  const token = jwt.sign({ id, role }, secret)
  return token
}

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body

    // Check all fields
    if (!name || !email || !password || !phone) {
      res.status(400).json({ message: "All fields are required" })
      return
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" })
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    })

    // Generate token
    const token = generateToken(user._id.toString(), user.role)

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Check fields
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" })
      return
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role)

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).userId).select("-password")
    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }
    res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address, phone, name } = req.body
    const user = await User.findByIdAndUpdate(
      (req as any).userId,
      { address, phone, name },
      { new: true }
    ).select("-password")

    res.status(200).json({ message: "Profile updated", user })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}