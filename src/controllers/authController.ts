import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User"
import crypto from "crypto"
import { sendPasswordResetEmail } from "../config/emailService"

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

// @desc    Forgot password - sends reset token via email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ message: "Email is required" })
      return
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      res.status(200).json({ message: "If this email exists you will receive a reset code" })
      return
    }

    // Prevent spam — only allow new token every 1 minute
if (user.resetPasswordExpiry) {
  const timeLeft = user.resetPasswordExpiry.getTime() - Date.now()
  const oneMinute = 14 * 60 * 1000 // 14 minutes left means token is less than 1 min old
  if (timeLeft > oneMinute) {
    res.status(400).json({ 
      message: "Please wait before requesting another code" 
    })
    return
  }
}

    // Generate 6 digit reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
    console.log("Generated token:", resetToken)

    // Hash the token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    // Save token and expiry to user
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: new Date(Date.now() + 15 * 60 * 1000),
    })

    console.log("Token saved to database")
    console.log("Sending email to:", email)
    console.log("EMAIL_USER:", process.env.EMAIL_USER)
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS)

    // Send email
    try {
      await sendPasswordResetEmail(email, resetToken)
      console.log("Email sent successfully!")
      res.status(200).json({ message: "Reset code sent to your email" })
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError.message)
      res.status(500).json({
        message: "Failed to send email",
        error: emailError.message,
      })
    }
  } catch (error: any) {
    console.error("Forgot password error:", error.message)
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password are required" })
      return
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    })

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset code" })
      return
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password and clear reset token
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpiry: undefined,
    })

    res.status(200).json({ message: "Password reset successfully" })
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}